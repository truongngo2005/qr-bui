package com.coffeeshop.shiftsystem.service.impl;

import com.coffeeshop.shiftsystem.dto.request.ExchangeActionDto;
import com.coffeeshop.shiftsystem.dto.request.ShiftExchangeCreateDto;
import com.coffeeshop.shiftsystem.entity.ShiftAssignment;
import com.coffeeshop.shiftsystem.entity.ShiftExchangeRequest;
import com.coffeeshop.shiftsystem.entity.User;
import com.coffeeshop.shiftsystem.exception.BadRequestException;
import com.coffeeshop.shiftsystem.exception.ResourceNotFoundException;
import com.coffeeshop.shiftsystem.repository.ShiftAssignmentRepository;
import com.coffeeshop.shiftsystem.repository.ShiftExchangeRequestRepository;
import com.coffeeshop.shiftsystem.repository.UserRepository;
import com.coffeeshop.shiftsystem.service.ShiftExchangeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShiftExchangeServiceImpl implements ShiftExchangeService {

    private final ShiftExchangeRequestRepository requestRepository;
    private final ShiftAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ShiftExchangeRequest createRequest(Long senderId, ShiftExchangeCreateDto dto) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên gửi yêu cầu"));

        ShiftAssignment senderAssignment = assignmentRepository.findById(dto.getSenderAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca làm việc cần đổi"));

        if (!senderAssignment.getUser().getId().equals(senderId)) {
            throw new BadRequestException("Bạn chỉ có thể tạo yêu cầu đổi hoặc xin nghỉ cho ca làm việc của chính mình!");
        }

        User receiver = null;
        if (dto.getReceiverId() != null) {
            receiver = userRepository.findById(dto.getReceiverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đồng nghiệp nhận yêu cầu"));
        }

        ShiftAssignment receiverAssignment = null;
        if (dto.getReceiverAssignmentId() != null) {
            receiverAssignment = assignmentRepository.findById(dto.getReceiverAssignmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca làm việc của đồng nghiệp"));
        }

        String initialStatus = "PENDING";
        // Nếu là đơn xin nghỉ trực tiếp tới quản lý (không có đồng nghiệp), chuyển thẳng sang chờ quản lý duyệt
        if ("LEAVE".equalsIgnoreCase(dto.getRequestType())) {
            initialStatus = "PENDING_MANAGER";
        }

        ShiftExchangeRequest req = ShiftExchangeRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .senderAssignment(senderAssignment)
                .receiverAssignment(receiverAssignment)
                .requestType(dto.getRequestType().toUpperCase())
                .status(initialStatus)
                .reason(dto.getReason().trim())
                .build();

        return requestRepository.save(req);
    }

    @Override
    @Transactional
    public ShiftExchangeRequest handlePeerAction(Long requestId, Long receiverId, ExchangeActionDto actionDto) {
        ShiftExchangeRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu ID: " + requestId));

        if (req.getReceiver() == null || !req.getReceiver().getId().equals(receiverId)) {
            throw new BadRequestException("Chỉ người nhận được yêu cầu mới có quyền Đồng ý hoặc Từ chối!");
        }

        if (!"PENDING".equals(req.getStatus())) {
            throw new BadRequestException("Yêu cầu này không còn ở trạng thái chờ xác nhận từ đồng nghiệp.");
        }

        if ("ACCEPT".equalsIgnoreCase(actionDto.getAction())) {
            req.setStatus("ACCEPTED"); // Đã đồng ý, chuyển sang chờ Quản lý phê duyệt cuối cùng
        } else if ("REJECT".equalsIgnoreCase(actionDto.getAction())) {
            req.setStatus("REJECTED");
        } else {
            throw new BadRequestException("Hành động không hợp lệ: " + actionDto.getAction());
        }

        return requestRepository.save(req);
    }

    @Override
    @Transactional
    public ShiftExchangeRequest handleManagerApproval(Long requestId, ExchangeActionDto actionDto) {
        ShiftExchangeRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu ID: " + requestId));

        if ("APPROVE".equalsIgnoreCase(actionDto.getAction())) {
            req.setStatus("APPROVED");
            req.setManagerNote(actionDto.getManagerNote());

            // THỰC HIỆN ĐỔI CA TỰ ĐỘNG TRONG DATABASE
            if ("EXCHANGE".equalsIgnoreCase(req.getRequestType())) {
                ShiftAssignment senderAss = req.getSenderAssignment();
                ShiftAssignment recvAss = req.getReceiverAssignment();

                if (recvAss != null) {
                    // Đổi ca chéo 2 người
                    User tempUser = senderAss.getUser();
                    senderAss.setUser(recvAss.getUser());
                    recvAss.setUser(tempUser);
                    assignmentRepository.save(senderAss);
                    assignmentRepository.save(recvAss);
                    log.info("[SHIFT EXCHANGE] Đã hoán đổi ca thành công giữa {} và {}",
                            senderAss.getUser().getFullName(), recvAss.getUser().getFullName());
                } else if (req.getReceiver() != null) {
                    // Chuyển ca sang cho người nhận làm thay
                    senderAss.setUser(req.getReceiver());
                    assignmentRepository.save(senderAss);
                    log.info("[SHIFT EXCHANGE] Đã chuyển nhượng ca của {} cho {}",
                            req.getSender().getFullName(), req.getReceiver().getFullName());
                }
            } else if ("LEAVE".equalsIgnoreCase(req.getRequestType())) {
                // Xin nghỉ phép được duyệt -> Đổi trạng thái ca làm thành CANCELLED
                ShiftAssignment senderAss = req.getSenderAssignment();
                senderAss.setStatus("CANCELLED");
                senderAss.setNotes((senderAss.getNotes() != null ? senderAss.getNotes() + " | " : "") + "Nghỉ phép có phép (Đã duyệt)");
                assignmentRepository.save(senderAss);
                log.info("[SHIFT LEAVE] Đã duyệt nghỉ phép ca ngày {} cho {}",
                        senderAss.getWorkDate(), req.getSender().getFullName());
            }

        } else if ("REJECT".equalsIgnoreCase(actionDto.getAction())) {
            req.setStatus("REJECTED");
            req.setManagerNote(actionDto.getManagerNote());
        } else {
            throw new BadRequestException("Hành động không hợp lệ: " + actionDto.getAction());
        }

        return requestRepository.save(req);
    }

    @Override
    public List<ShiftExchangeRequest> getRequestsForUser(Long userId) {
        return requestRepository.findByUserInvolved(userId);
    }

    @Override
    public List<ShiftExchangeRequest> getAllRequests(String status) {
        if (status != null && !status.isBlank()) {
            return requestRepository.findByStatusOrderByCreatedAtDesc(status.trim().toUpperCase());
        }
        return requestRepository.findAll();
    }
}
