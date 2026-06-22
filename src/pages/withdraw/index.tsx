import React, { useState } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import classnames from 'classnames';
import dayjs from 'dayjs';

const withdrawMethods = [
  { key: 'wechat', name: '微信钱包', desc: 'T+1到账，免手续费', icon: '💬' },
  { key: 'alipay', name: '支付宝', desc: 'T+1到账，免手续费', icon: '💰' }
];

const quickAmounts = [50, 100, 200, 500];

const WithdrawPage: React.FC = () => {
  const { wallet, setWallet, addIncomeRecord, paymentAccounts, paymentPassword, verifyPaymentPassword } = useAppContext();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdInput, setPwdInput] = useState('');

  const defaultAccount = paymentAccounts.find((a) => a.isDefault && a.type === selectedMethod)
    || paymentAccounts.find((a) => a.type === selectedMethod);

  const withdrawFee = 0;
  const actualAmount = parseFloat(amount) || 0;

  const handleQuickAmount = (val: number) => {
    if (val > wallet.balance) {
      Taro.showToast({ title: '余额不足', icon: 'none' });
      return;
    }
    setAmount(val.toString());
  };

  const handleAll = () => {
    setAmount(wallet.balance.toString());
  };

  const handleWithdraw = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      Taro.showToast({ title: '请输入提现金额', icon: 'none' });
      return;
    }
    if (num > wallet.balance) {
      Taro.showToast({ title: '余额不足', icon: 'none' });
      return;
    }
    if (num < 1) {
      Taro.showToast({ title: '最低提现1元', icon: 'none' });
      return;
    }
    if (!defaultAccount) {
      Taro.showModal({
        title: '请先添加收款账户',
        content: `请先添加${selectedMethod === 'wechat' ? '微信' : '支付宝'}收款账户`,
        confirmText: '去添加',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/account-manage/index' });
          }
        }
      });
      return;
    }

    console.log('[Withdraw] 申请提现:', num, selectedMethod, defaultAccount.account);

    if (paymentPassword.hasPassword) {
      setShowPasswordModal(true);
      setPwdInput('');
    } else {
      doWithdraw(num);
    }
  };

  const handlePasswordConfirm = async () => {
    if (pwdInput.length !== 6) {
      Taro.showToast({ title: '请输入6位密码', icon: 'none' });
      return;
    }

    const valid = await verifyPaymentPassword(pwdInput);
    if (valid) {
      setShowPasswordModal(false);
      doWithdraw(parseFloat(amount));
    } else {
      Taro.showToast({ title: '密码错误', icon: 'error' });
      setPwdInput('');
    }
  };

  const doWithdraw = (num: number) => {
    console.log('[Withdraw] 执行提现:', num);
    Taro.showLoading({ title: '提交中...' });

    setTimeout(() => {
      const withdrawId = 'withdraw_' + Date.now();
      setLastWithdrawId(withdrawId);

      addIncomeRecord({
        id: withdrawId,
        orderId: withdrawId,
        orderNo: 'TX' + dayjs().format('YYYYMMDDHHmmss'),
        petName: '提现到' + (selectedMethod === 'wechat' ? '微信' : '支付宝'),
        amount: num,
        type: 'withdraw',
        status: 'pending',
        createTime: dayjs().format('YYYY-MM-DD HH:mm'),
        withdrawMethod: selectedMethod,
        withdrawAccount: defaultAccount?.name + ' (' + defaultAccount?.account + ')'
      } as any);

      Taro.hideLoading();
      setShowSuccess(true);
      console.log('[Withdraw] 提现申请成功');
    }, 800);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    Taro.navigateBack();
  };

  const [lastWithdrawId, setLastWithdrawId] = useState<string>('');

  const handleViewBill = () => {
    if (lastWithdrawId) {
      setShowSuccess(false);
      setTimeout(() => {
        Taro.navigateTo({ url: `/pages/bill-detail/index?id=${lastWithdrawId}` });
      }, 50);
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.label}>可提现金额（元）</Text>
        <View className={styles.amount}>
          <Text className={styles.unit}>¥</Text>
          {wallet.balance.toFixed(2)}
        </View>
        <Text className={styles.desc}>提现免手续费，T+1到账</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>提现方式</Text>
        <View className={styles.methodList}>
          {withdrawMethods.map((method) => (
            <View
              key={method.key}
              className={classnames(styles.methodItem, {
                [styles.active]: selectedMethod === method.key
              })}
              onClick={() => setSelectedMethod(method.key)}
            >
              <View className={styles.icon}>{method.icon}</View>
              <View className={styles.info}>
                <Text className={styles.name}>{method.name}</Text>
                <Text className={styles.desc}>{method.desc}</Text>
              </View>
              <View
                className={classnames(styles.radio, {
                  [styles.active]: selectedMethod === method.key
                })}
              />
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>提现金额</Text>
        <View className={styles.amountInput}>
          <View className={styles.inputBox}>
            <Text className={styles.prefix}>¥</Text>
            <Input
              className={styles.input}
              type="digit"
              placeholder="请输入金额"
              value={amount}
              onInput={(e) => setAmount(e.detail.value)}
            />
          </View>

          <View className={styles.quickAmounts}>
            {quickAmounts.map((val) => (
              <Button
                key={val}
                className={classnames(styles.amountBtn, {
                  [styles.active]: amount === val.toString()
                })}
                onClick={() => handleQuickAmount(val)}
              >
                {val}元
              </Button>
            ))}
            <Button
              className={styles.amountBtn}
              onClick={handleAll}
            >
              全部
            </Button>
          </View>

          <Text className={styles.hint}>
            最低提现1元，每日最多提现10000元
          </Text>

          <View className={styles.feeInfo}>
            <Text className={styles.label}>提现手续费</Text>
            <Text className={styles.value}>¥{withdrawFee.toFixed(2)}（免）</Text>
          </View>
          <View className={styles.feeInfo}>
            <Text className={styles.label}>实际到账</Text>
            <Text className={styles.value}>¥{actualAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <Button
          className={styles.confirmBtn}
          onClick={handleWithdraw}
          disabled={!actualAmount || actualAmount <= 0}
        >
          确认提现 ¥{actualAmount.toFixed(2)}
        </Button>
        <Text className={styles.tip}>预计1-2个工作日到账</Text>
      </View>

      {showPasswordModal && (
        <View className={styles.successModal} onClick={() => setShowPasswordModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.title}>请输入支付密码</Text>
            <Text className={styles.desc}>提现金额 ¥{actualAmount.toFixed(2)}</Text>
            
            <View className={styles.passwordBoxes}>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <View key={idx} className={styles.pwdBox}>
                  {pwdInput.length > idx && <View className={styles.pwdDot} />}
                </View>
              ))}
            </View>
            
            <Input
              className={styles.hiddenInput}
              type='number'
              maxlength={6}
              value={pwdInput}
              onInput={(e) => setPwdInput(e.detail.value)}
              focus
            />

            <View className={styles.modalBtns}>
              <Button
                className={classnames(styles.modalBtn, styles.cancelBtn)}
                onClick={() => setShowPasswordModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.confirmBtn)}
                onClick={handlePasswordConfirm}
              >
                确定
              </Button>
            </View>

            <Text
              className={styles.forgetPwd}
              onClick={() => Taro.showToast({ title: '请联系客服重置', icon: 'none' })}
            >
              忘记密码？
            </Text>
          </View>
        </View>
      )}

      {showSuccess && (
        <View className={styles.successModal} onClick={handleSuccessClose}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.icon}>✅</Text>
            <Text className={styles.title}>提现申请已提交</Text>
            <Text className={styles.successAmount}>-¥{actualAmount.toFixed(2)}</Text>
            <Text className={styles.desc}>
              预计明天24:00前到账您的
              {selectedMethod === 'wechat' ? '微信钱包' : '支付宝'}账户
            </Text>
            <View className={styles.successBtns}>
              <Button
                className={classnames(styles.btn, styles.btnOutline)}
                onClick={handleViewBill}
              >
                查看账单
              </Button>
              <Button className={styles.btn} onClick={handleSuccessClose}>
                完成
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default WithdrawPage;
