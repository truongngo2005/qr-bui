package com.coffeeshop.shiftsystem.service.impl;

import com.coffeeshop.shiftsystem.dto.request.UserCreateDto;
import com.coffeeshop.shiftsystem.dto.request.UserUpdateDto;
import com.coffeeshop.shiftsystem.dto.response.UserProfileDto;
import com.coffeeshop.shiftsystem.entity.User;
import com.coffeeshop.shiftsystem.exception.BadRequestException;
import com.coffeeshop.shiftsystem.exception.ResourceNotFoundException;
import com.coffeeshop.shiftsystem.repository.UserRepository;
import com.coffeeshop.shiftsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public List<UserProfileDto> getAllUsers(String search) {
        List<User> users;
        if (search != null && !search.isBlank()) {
            users = userRepository.searchUsers(search.trim());
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public UserProfileDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với ID: " + id));
        return toDto(user);
    }

    @Override
    @Transactional
    public UserProfileDto createUser(UserCreateDto createDto) {
        if (userRepository.existsByPhoneNumber(createDto.getPhoneNumber().trim())) {
            throw new BadRequestException("Số điện thoại này đã được đăng ký bởi nhân viên khác!");
        }
        if (userRepository.existsByEmail(createDto.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email này đã được đăng ký trong hệ thống!");
        }

        User user = User.builder()
                .fullName(createDto.getFullName().trim())
                .phoneNumber(createDto.getPhoneNumber().trim())
                .email(createDto.getEmail().trim().toLowerCase())
                .role(createDto.getRole())
                .position(createDto.getPosition().trim())
                .hourlyRate(createDto.getHourlyRate())
                .isActive(createDto.getIsActive() != null ? createDto.getIsActive() : true)
                .build();

        return toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserProfileDto updateUser(Long id, UserUpdateDto updateDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với ID: " + id));

        String newPhone = updateDto.getPhoneNumber().trim();
        if (!user.getPhoneNumber().equals(newPhone) && userRepository.existsByPhoneNumber(newPhone)) {
            throw new BadRequestException("Số điện thoại này đã được sử dụng bởi nhân viên khác!");
        }

        String newEmail = updateDto.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new BadRequestException("Email này đã được sử dụng bởi nhân viên khác!");
        }

        user.setFullName(updateDto.getFullName().trim());
        user.setPhoneNumber(newPhone);
        user.setEmail(newEmail);
        user.setRole(updateDto.getRole());
        user.setPosition(updateDto.getPosition().trim());
        user.setHourlyRate(updateDto.getHourlyRate());
        if (updateDto.getIsActive() != null) {
            user.setIsActive(updateDto.getIsActive());
        }

        return toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với ID: " + id));
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserProfileDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với ID: " + id));
        user.setIsActive(!user.getIsActive());
        return toDto(userRepository.save(user));
    }

    private UserProfileDto toDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .email(user.getEmail())
                .role(user.getRole())
                .position(user.getPosition())
                .hourlyRate(user.getHourlyRate())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
