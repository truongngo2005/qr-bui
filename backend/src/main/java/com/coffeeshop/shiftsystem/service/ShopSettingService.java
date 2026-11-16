package com.coffeeshop.shiftsystem.service;

import com.coffeeshop.shiftsystem.dto.request.SettingUpdateDto;
import com.coffeeshop.shiftsystem.entity.ShopSetting;

import java.util.List;

public interface ShopSettingService {
    List<ShopSetting> getAllSettings();
    ShopSetting getSetting(String key);
    String getSettingValue(String key, String defaultValue);
    ShopSetting updateSetting(SettingUpdateDto dto);
}
