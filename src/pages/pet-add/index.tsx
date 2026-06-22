import React, { useState } from 'react';
import { View, Text, Button, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import type { Pet, PetType, Vaccine } from '@/types';
import classnames from 'classnames';
import dayjs from 'dayjs';

const personalityOptions = ['温顺', '亲人', '活泼', '高冷', '粘人', '胆小', '贪吃', '护食', '爱干净', '爱玩', '聪明', '懒'];

const breedOptions = {
  dog: ['金毛', '拉布拉多', '柯基', '泰迪', '边牧', '萨摩耶', '哈士奇', '柴犬', '比熊', '博美', '其他'],
  cat: ['布偶', '英短', '美短', '橘猫', '狸花猫', '暹罗', '波斯', '加菲', '缅因', '无毛', '其他']
};

const PetAddPage: React.FC = () => {
  const { addPet } = useAppContext();
  const [formData, setFormData] = useState<Partial<Pet>>({
    type: 'dog',
    gender: 'male',
    personalityTags: [],
    vaccines: [],
    isRegular: false
  });

  const updateForm = (key: keyof Pet, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTypeChange = (type: PetType) => {
    updateForm('type', type);
    updateForm('breed', '');
  };

  const handlePersonalityToggle = (tag: string) => {
    const current = formData.personalityTags || [];
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    updateForm('personalityTags', updated);
  };

  const handleAddVaccine = () => {
    Taro.showActionSheet({
      itemList: ['狂犬疫苗', '六联疫苗', '猫三联', '其他疫苗'],
      success: (res) => {
        const names = ['狂犬疫苗', '六联疫苗', '猫三联', '其他疫苗'];
        const name = names[res.tapIndex];
        const today = dayjs().format('YYYY-MM-DD');
        const nextDate = dayjs().add(1, 'year').format('YYYY-MM-DD');
        const newVaccine: Vaccine = { name, date: today, nextDate };
        const current = formData.vaccines || [];
        updateForm('vaccines', [...current, newVaccine]);
      }
    });
  };

  const handleDeleteVaccine = (index: number) => {
    const current = formData.vaccines || [];
    updateForm('vaccines', current.filter((_, i) => i !== index));
  };

  const handleBreedSelect = () => {
    const options = breedOptions[formData.type || 'dog'];
    Taro.showActionSheet({
      itemList: options,
      success: (res) => {
        updateForm('breed', options[res.tapIndex]);
      }
    });
  };

  const handleSave = () => {
    console.log('[PetAdd] 保存宠物档案:', formData);
    
    if (!formData.name) {
      Taro.showToast({ title: '请输入宠物名字', icon: 'none' });
      return;
    }
    if (!formData.breed) {
      Taro.showToast({ title: '请选择品种', icon: 'none' });
      return;
    }
    if (!formData.age && formData.age !== 0) {
      Taro.showToast({ title: '请输入年龄', icon: 'none' });
      return;
    }
    if (!formData.weight && formData.weight !== 0) {
      Taro.showToast({ title: '请输入体重', icon: 'none' });
      return;
    }
    if (!formData.dietHabit) {
      Taro.showToast({ title: '请填写饮食习惯', icon: 'none' });
      return;
    }
    if (!formData.ownerName) {
      Taro.showToast({ title: '请输入主人姓名', icon: 'none' });
      return;
    }
    if (!formData.ownerPhone) {
      Taro.showToast({ title: '请输入主人电话', icon: 'none' });
      return;
    }
    if (!formData.emergencyContact?.name) {
      Taro.showToast({ title: '请填写紧急联系人', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '保存中...' });
    setTimeout(() => {
      const petAvatar = formData.type === 'dog' 
        ? 'https://picsum.photos/id/237/200/200'
        : 'https://picsum.photos/id/659/200/200';

      addPet({
        name: formData.name!,
        type: formData.type!,
        breed: formData.breed!,
        age: formData.age!,
        gender: formData.gender!,
        weight: formData.weight!,
        avatar: petAvatar,
        personalityTags: formData.personalityTags || [],
        dietHabit: formData.dietHabit!,
        vaccines: formData.vaccines || [],
        emergencyContact: formData.emergencyContact!,
        ownerName: formData.ownerName!,
        ownerPhone: formData.ownerPhone!,
        remark: formData.remark,
        isRegular: formData.isRegular
      });

      Taro.hideLoading();
      Taro.showToast({ title: '保存成功', icon: 'success' });
      console.log('[PetAdd] 宠物档案保存成功');
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }, 500);
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🐾</Text>宠物类型
        </Text>
        <View className={styles.typeSelector}>
          <Button
            className={classnames(styles.typeBtn, { [styles.active]: formData.type === 'dog' })}
            onClick={() => handleTypeChange('dog')}
          >
            <Text className={styles.icon}>🐕</Text>
            <Text className={styles.text}>狗狗</Text>
          </Button>
          <Button
            className={classnames(styles.typeBtn, { [styles.active]: formData.type === 'cat' })}
            onClick={() => handleTypeChange('cat')}
          >
            <Text className={styles.icon}>🐱</Text>
            <Text className={styles.text}>猫咪</Text>
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📋</Text>基本信息
          <Text className={styles.required}>*</Text>
        </Text>
        <View className={styles.formRow}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>名字
          </Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              placeholder="请输入宠物名字"
              value={formData.name}
              onInput={(e) => updateForm('name', e.detail.value)}
            />
          </View>
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>品种
          </Text>
          <View className={styles.inputWrapper} onClick={handleBreedSelect}>
            <Text className={classnames(styles.valueText, { [styles.input]: formData.breed })}>
              {formData.breed || '请选择品种'}
            </Text>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>年龄
          </Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              type="digit"
              placeholder="请输入年龄"
              value={String(formData.age || '')}
              onInput={(e) => updateForm('age', parseFloat(e.detail.value) || 0)}
            />
            <Text className={styles.unit}>岁</Text>
          </View>
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}>性别</Text>
          <View className={styles.inputWrapper}>
            <View className={styles.genderSelector} style={{ width: '300rpx' }}>
              <Button
                className={classnames(styles.genderBtn, { [styles.active]: formData.gender === 'male' })}
                onClick={() => updateForm('gender', 'male')}
              >
                ♂ 公
              </Button>
              <Button
                className={classnames(styles.genderBtn, { [styles.active]: formData.gender === 'female' })}
                onClick={() => updateForm('gender', 'female')}
              >
                ♀ 母
              </Button>
            </View>
          </View>
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>体重
          </Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              type="digit"
              placeholder="请输入体重"
              value={String(formData.weight || '')}
              onInput={(e) => updateForm('weight', parseFloat(e.detail.value) || 0)}
            />
            <Text className={styles.unit}>kg</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🏷️</Text>性格标签
        </Text>
        <View className={styles.personalityOptions}>
          {personalityOptions.map((tag) => (
            <Button
              key={tag}
              className={classnames(styles.tag, {
                [styles.active]: (formData.personalityTags || []).includes(tag)
              })}
              onClick={() => handlePersonalityToggle(tag)}
            >
              {tag}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>💉</Text>疫苗情况
        </Text>
        <View className={styles.vaccineList}>
          {(formData.vaccines || []).map((vaccine, idx) => (
            <View key={idx} className={styles.vaccineItem}>
              <Text className={styles.input}>{vaccine.name}</Text>
              <Text className={styles.date}>{vaccine.date.slice(5)}</Text>
              <Button
                className={styles.deleteBtn}
                onClick={() => handleDeleteVaccine(idx)}
              >
                ×
              </Button>
            </View>
          ))}
        </View>
        <Button className={styles.addBtn} onClick={handleAddVaccine}>
          + 添加疫苗记录
        </Button>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🍽️</Text>饮食习惯
          <Text className={styles.required}>*</Text>
        </Text>
        <Textarea
          className={styles.textarea}
          placeholder="请详细描述宠物的饮食习惯，如每日几餐、食量、是否有特殊饮食禁忌等"
          value={formData.dietHabit}
          onInput={(e) => updateForm('dietHabit', e.detail.value)}
        />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>👤</Text>主人信息
          <Text className={styles.required}>*</Text>
        </Text>
        <View className={styles.formRow}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>姓名
          </Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              placeholder="请输入主人姓名"
              value={formData.ownerName}
              onInput={(e) => updateForm('ownerName', e.detail.value)}
            />
          </View>
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>电话
          </Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              type="number"
              placeholder="请输入联系电话"
              value={formData.ownerPhone}
              onInput={(e) => updateForm('ownerPhone', e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📞</Text>紧急联系人
          <Text className={styles.required}>*</Text>
        </Text>
        <View className={styles.formRow}>
          <Text className={styles.label}>姓名</Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              placeholder="紧急联系人姓名"
              value={formData.emergencyContact?.name}
              onInput={(e) => updateForm('emergencyContact', {
                ...formData.emergencyContact,
                name: e.detail.value,
                relation: formData.emergencyContact?.relation || '主人',
                phone: formData.emergencyContact?.phone || ''
              })}
            />
          </View>
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}>关系</Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              placeholder="与宠物的关系"
              value={formData.emergencyContact?.relation}
              onInput={(e) => updateForm('emergencyContact', {
                ...formData.emergencyContact,
                name: formData.emergencyContact?.name || '',
                relation: e.detail.value,
                phone: formData.emergencyContact?.phone || ''
              })}
            />
          </View>
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}>电话</Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              type="number"
              placeholder="紧急联系电话"
              value={formData.emergencyContact?.phone}
              onInput={(e) => updateForm('emergencyContact', {
                ...formData.emergencyContact,
                name: formData.emergencyContact?.name || '',
                relation: formData.emergencyContact?.relation || '',
                phone: e.detail.value
              })}
            />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📝</Text>备注
        </Text>
        <Textarea
          className={styles.textarea}
          placeholder="其他需要注意的事项，如过敏史、常用药物、特殊喜好等"
          value={formData.remark}
          onInput={(e) => updateForm('remark', e.detail.value)}
        />
      </View>

      <View className={styles.footer}>
        <Button className={styles.saveBtn} onClick={handleSave}>
          保存档案
        </Button>
      </View>
    </View>
  );
};

export default PetAddPage;
