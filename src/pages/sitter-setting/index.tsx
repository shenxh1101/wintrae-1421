import React, { useState, useEffect } from 'react';
import { View, Text, Button, Input, Textarea, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import type { SitterSetting } from '@/types';
import classnames from 'classnames';
import dayjs from 'dayjs';

const forbiddenOptions = ['烈性犬', '未打疫苗', '有传染病', '怀孕宠物', '老年宠物', '攻击性强'];
const serviceOptions = ['每日遛弯', '定时喂食', '实时照片', '24小时监控', '清洁美容', '紧急送医', '视频通话', '接送服务'];
const breedOptions = {
  dog: ['金毛', '拉布拉多', '柯基', '泰迪', '边牧', '萨摩耶', '哈士奇', '柴犬', '比熊', '博美'],
  cat: ['布偶', '英短', '美短', '橘猫', '狸花猫', '暹罗', '波斯', '加菲', '缅因', '无毛']
};

const SitterSettingPage: React.FC = () => {
  const { sitterSetting, updateSitterSetting } = useAppContext();
  const [formData, setFormData] = useState<SitterSetting>(sitterSetting);

  useEffect(() => {
    console.log('[SitterSetting] 页面加载，当前设置:', sitterSetting);
  }, []);

  const handleSwitchChange = (key: 'acceptDog' | 'acceptCat', value: boolean) => {
    console.log('[SitterSetting] 切换接受类型:', key, value);
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (key: 'dogPrice' | 'catPrice', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({ ...prev, [key]: numValue }));
  };

  const handleCapacityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({ ...prev, dailyCapacity: numValue }));
  };

  const handleBreedToggle = (type: 'dog' | 'cat', breed: string) => {
    const key = type === 'dog' ? 'dogBreeds' : 'catBreeds';
    const current = formData[key] || [];
    const updated = current.includes(breed)
      ? current.filter((b) => b !== breed)
      : [...current, breed];
    setFormData((prev) => ({ ...prev, [key]: updated }));
  };

  const handleForbiddenToggle = (condition: string) => {
    const current = formData.forbiddenConditions;
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    setFormData((prev) => ({ ...prev, forbiddenConditions: updated }));
  };

  const handleServiceToggle = (service: string) => {
    const current = formData.serviceItems;
    const updated = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
    setFormData((prev) => ({ ...prev, serviceItems: updated }));
  };

  const handleAddDate = () => {
    const today = dayjs();
    const dates: string[] = [];
    for (let i = 0; i < 30; i++) {
      dates.push(today.add(i, 'day').format('YYYY-MM-DD'));
    }
    Taro.showActionSheet({
      itemList: dates.slice(0, 15),
      success: (res) => {
        const selectedDate = dates[res.tapIndex];
        if (!formData.availableDates.includes(selectedDate)) {
          setFormData((prev) => ({
            ...prev,
            availableDates: [...prev.availableDates, selectedDate].sort()
          }));
        }
      }
    });
  };

  const handleRemoveDate = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      availableDates: prev.availableDates.filter((d) => d !== date)
    }));
  };

  const handleSave = () => {
    console.log('[SitterSetting] 保存设置:', formData);
    Taro.showLoading({ title: '保存中...' });
    setTimeout(() => {
      updateSitterSetting(formData);
      Taro.hideLoading();
      Taro.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }, 500);
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🐾</Text>可接宠物类型
        </Text>
        <View className={styles.switchRow}>
          <Text className={styles.label}>
            <Text className={styles.typeIcon}>🐕</Text>接受狗狗寄养
          </Text>
          <Switch
            checked={formData.acceptDog}
            onChange={(e) => handleSwitchChange('acceptDog', e.detail.value)}
            color="#ff7a45"
          />
        </View>
        {formData.acceptDog && (
          <>
            <View className={styles.tagList}>
              {breedOptions.dog.map((breed) => (
                <Button
                  key={breed}
                  className={classnames(styles.tag, {
                    [styles.active]: (formData.dogBreeds || []).includes(breed)
                  })}
                  onClick={() => handleBreedToggle('dog', breed)}
                >
                  {breed}
                </Button>
              ))}
            </View>
            <View className={styles.inputRow}>
              <Text className={styles.label}>狗狗每日价格</Text>
              <View className={styles.inputWrapper}>
                <Input
                  className={styles.input}
                  type="digit"
                  value={String(formData.dogPrice)}
                  onInput={(e) => handlePriceChange('dogPrice', e.detail.value)}
                />
                <Text className={styles.unit}>元/天</Text>
              </View>
            </View>
          </>
        )}
        <View className={styles.switchRow}>
          <Text className={styles.label}>
            <Text className={styles.typeIcon}>🐱</Text>接受猫咪寄养
          </Text>
          <Switch
            checked={formData.acceptCat}
            onChange={(e) => handleSwitchChange('acceptCat', e.detail.value)}
            color="#ff7a45"
          />
        </View>
        {formData.acceptCat && (
          <>
            <View className={styles.tagList}>
              {breedOptions.cat.map((breed) => (
                <Button
                  key={breed}
                  className={classnames(styles.tag, {
                    [styles.active]: (formData.catBreeds || []).includes(breed)
                  })}
                  onClick={() => handleBreedToggle('cat', breed)}
                >
                  {breed}
                </Button>
              ))}
            </View>
            <View className={styles.inputRow}>
              <Text className={styles.label}>猫咪每日价格</Text>
              <View className={styles.inputWrapper}>
                <Input
                  className={styles.input}
                  type="digit"
                  value={String(formData.catPrice)}
                  onInput={(e) => handlePriceChange('catPrice', e.detail.value)}
                />
                <Text className={styles.unit}>元/天</Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🏠</Text>接待容量
        </Text>
        <View className={styles.inputRow}>
          <Text className={styles.label}>每日最大接待量</Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              type="number"
              value={String(formData.dailyCapacity)}
              onInput={(e) => handleCapacityChange(e.detail.value)}
            />
            <Text className={styles.unit}>只</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>⚠️</Text>禁养条件
        </Text>
        <View className={styles.tagList}>
          {forbiddenOptions.map((condition) => (
            <Button
              key={condition}
              className={classnames(styles.tag, {
                [styles.active]: formData.forbiddenConditions.includes(condition)
              })}
              onClick={() => handleForbiddenToggle(condition)}
            >
              {condition}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📅</Text>可预约日期
        </Text>
        <View className={styles.dateList}>
          {formData.availableDates.slice(0, 10).map((date) => (
            <Button
              key={date}
              className={styles.dateItem}
              onClick={() => handleRemoveDate(date)}
            >
              {date.slice(5)}
              <Text className={styles.delete}>×</Text>
            </Button>
          ))}
        </View>
        <Button className={styles.addBtn} onClick={handleAddDate}>
          + 添加可预约日期
        </Button>
        <Text className={styles.sectionHint}>
          点击日期可删除，不设置则默认全部日期可预约
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🎁</Text>服务项目
        </Text>
        <View className={styles.tagList}>
          {serviceOptions.map((service) => (
            <Button
              key={service}
              className={classnames(styles.tag, {
                [styles.active]: formData.serviceItems.includes(service)
              })}
              onClick={() => handleServiceToggle(service)}
            >
              {service}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.footer}>
        <Button className={styles.saveBtn} onClick={handleSave}>
          保存设置
        </Button>
      </View>
    </View>
  );
};

export default SitterSettingPage;
