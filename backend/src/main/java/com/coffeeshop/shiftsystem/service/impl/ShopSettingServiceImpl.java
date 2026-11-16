package com.coffeeshop.shiftsystem.service.impl;

import com.coffeeshop.shiftsystem.dto.request.SettingUpdateDto;
import com.coffeeshop.shiftsystem.entity.ShopSetting;
import com.coffeeshop.shiftsystem.exception.ResourceNotFoundException;
import com.coffeeshop.shiftsystem.repository.ShopSettingRepository;
import com.coffeeshop.shiftsystem.service.ShopSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShopSettingServiceImpl implements ShopSettingService {

    private final ShopSettingRepository settingRepository;

    @Override
    public List<ShopSetting> getAllSettings() {
        return settingRepository.findAll();
    }

    @Override
    public ShopSetting getSetting(String key) {
        return settingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cấu hình: " + key));
    }

    @Override
    public String getSettingValue(String key, String defaultValue) {
        return settingRepository.findBySettingKey(key)
                .map(ShopSetting::getSettingValue)
                .orElse(defaultValue);
    }

    @Override
    @Transactional
    public ShopSetting updateSetting(SettingUpdateDto dto) {
        ShopSetting setting = settingRepository.findBySettingKey(dto.getSettingKey())
                .orElse(ShopSetting.builder()
                        .settingKey(dto.getSettingKey())
                        .description(dto.getDescription())
                        .build());

        setting.setSettingValue(dto.getSettingValue());
        if (dto.getDescription() != null) {
            setting.setDescription(dto.getDescription());
        }

        return settingRepository.save(setting);
    }
}
