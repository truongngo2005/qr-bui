package com.coffeeshop.shiftsystem.service;

import com.coffeeshop.shiftsystem.dto.request.UserCreateDto;
import com.coffeeshop.shiftsystem.dto.request.UserUpdateDto;
import com.coffeeshop.shiftsystem.dto.response.UserProfileDto;

import java.util.List;

public interface UserService {
    List<UserProfileDto> getAllUsers(String search);
    UserProfileDto getUserById(Long id);
    UserProfileDto createUser(UserCreateDto createDto);
    UserProfileDto updateUser(Long id, UserUpdateDto updateDto);
    void deleteUser(Long id);
    UserProfileDto toggleUserStatus(Long id);
}
