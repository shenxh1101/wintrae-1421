import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import classnames from 'classnames';

type Step = 'verify' | 'set' | 'confirm';

const PasswordSetPage: React.FC = () => {
  const { paymentPassword, setPaymentPassword, verifyPaymentPassword } = useAppContext();
  const [step, setStep] = useState<Step>(paymentPassword.hasPassword ? 'verify' : 'set');
  const [pwd, setPwd] = useState('');
  const [firstPwd, setFirstPwd] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<any>(null);

  const keyboardLayout = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['delete', '0', 'confirm']
  ];

  useEffect(() => {
    console.log('[PasswordSet] 当前步骤:', step, '已设置密码:', paymentPassword.hasPassword);
  }, [step, paymentPassword.hasPassword]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (key: string) => {
    console.log('[PasswordSet] 按键:', key);

    if (key === 'delete') {
      setPwd((prev) => prev.slice(0, -1));
      return;
    }

    if (key === 'confirm') {
      handleConfirm();
      return;
    }

    if (pwd.length < 6) {
      setPwd((prev) => prev + key);
    }
  };

  const handleConfirm = async () => {
    if (pwd.length !== 6) {
      Taro.showToast({ title: '请输入6位密码', icon: 'none' });
      return;
    }

    if (step === 'verify') {
      console.log('[PasswordSet] 验证旧密码...');
      const valid = await verifyPaymentPassword(pwd);
      if (valid) {
        setPwd('');
        setFirstPwd('');
        setStep('set');
        Taro.showToast({ title: '验证成功', icon: 'success' });
      } else {
        Taro.showToast({ title: '密码错误', icon: 'error' });
        setPwd('');
      }
      return;
    }

    if (step === 'set') {
      setFirstPwd(pwd);
      setPwd('');
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      if (pwd !== firstPwd) {
        Taro.showToast({ title: '两次密码不一致', icon: 'error' });
        setPwd('');
        return;
      }

      console.log('[PasswordSet] 设置新密码...');
      const success = await setPaymentPassword(pwd);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          Taro.navigateBack();
        }, 1500);
      } else {
        Taro.showToast({ title: '设置失败，请重试', icon: 'error' });
      }
    }
  };

  const handleForget = () => {
    Taro.showModal({
      title: '忘记密码',
      content: '忘记密码可通过绑定的手机号重置，或联系客服处理。是否重置？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '重置功能开发中', icon: 'none' });
        }
      }
    });
  };

  const getTitle = () => {
    if (step === 'verify') return '请输入支付密码';
    if (step === 'set') return paymentPassword.hasPassword ? '设置新支付密码' : '设置支付密码';
    return '请再次输入支付密码';
  };

  const getSubtitle = () => {
    if (step === 'verify') return '用于验证身份';
    if (step === 'set') return '支付密码用于提现等敏感操作';
    return '确保两次输入一致';
  };

  return (
    <View className={styles.page} onClick={focusInput}>
      <Text className={styles.title}>{getTitle()}</Text>
      <Text className={styles.subtitle}>{getSubtitle()}</Text>

      {(step === 'set' || step === 'confirm') && (
        <View className={styles.stepIndicator}>
          <View className={classnames(styles.step, { [styles.active]: step === 'set' || step === 'confirm' })} />
          <View className={classnames(styles.step, { [styles.active]: step === 'confirm' })} />
        </View>
      )}

      <View className={styles.passwordBoxes}>
        {[0, 1, 2, 3, 4, 5].map((idx) => (
          <View
            key={idx}
            className={classnames(styles.box, {
              [styles.active]: pwd.length === idx,
              [styles.filled]: pwd.length > idx
            })}
          >
            {pwd.length > idx && <View className={styles.dot} />}
          </View>
        ))}
      </View>

      <Input
        ref={inputRef}
        className={styles.passwordInput}
        type='number'
        maxlength={6}
        value={pwd}
        onInput={(e) => setPwd(e.detail.value)}
        focus
      />

      <View className={styles.keyboard}>
        {keyboardLayout.map((row, rowIdx) => (
          <View key={rowIdx} className={styles.row}>
            {row.map((key) => (
              <Button
                key={key}
                className={classnames(styles.key, {
                  [styles.confirm]: key === 'confirm',
                  [styles.delete]: key === 'delete'
                })}
                onClick={() => handleKeyPress(key)}
              >
                {key === 'delete' ? '⌫' : key === 'confirm' ? '确定' : key}
              </Button>
            ))}
          </View>
        ))}
      </View>

      <View className={styles.tips}>
        <Text className={styles.tipText}>
          请设置6位数字支付密码，不要与其他平台密码相同
        </Text>
        {step === 'verify' && (
          <Text className={styles.forgetLink} onClick={handleForget}>
            忘记密码？
          </Text>
        )}
      </View>

      {showSuccess && (
        <View className={styles.successToast}>
          ✓ 密码设置成功
        </View>
      )}
    </View>
  );
};

export default PasswordSetPage;
