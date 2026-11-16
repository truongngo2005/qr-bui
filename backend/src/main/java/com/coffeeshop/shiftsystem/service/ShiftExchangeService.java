package com.coffeeshop.shiftsystem.service;

import com.coffeeshop.shiftsystem.dto.request.ExchangeActionDto;
import com.coffeeshop.shiftsystem.dto.request.ShiftExchangeCreateDto;
import com.coffeeshop.shiftsystem.entity.ShiftExchangeRequest;

import java.util.List;

public interface ShiftExchangeService {
    ShiftExchangeRequest createRequest(Long senderId, ShiftExchangeCreateDto dto);
    ShiftExchangeRequest handlePeerAction(Long requestId, Long receiverId, ExchangeActionDto actionDto);
    ShiftExchangeRequest handleManagerApproval(Long requestId, ExchangeActionDto actionDto);
    List<ShiftExchangeRequest> getRequestsForUser(Long userId);
    List<ShiftExchangeRequest> getAllRequests(String status);
}
