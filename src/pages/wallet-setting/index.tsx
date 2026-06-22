import React, { useState } from 'react';
import { View, Text, Button, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import classnames from 'classnames';

const WalletSettingPage: React.FC = () => {
  const { wallet, resetData } = useAppContext();
  const [notify, setNotify] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  const handlePwdSet = () => {
    Taro.showModal({
      title: '设置支付密码',
      content: '支付密码用于提现等敏感操作，设置后更加安全',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '密码设置开发中', icon: 'none' });
        }
      }
    });
  };

  const handleBankCard = () => {
    Taro.showActionSheet({
      itemList: ['添加银行卡', '查看已绑定'],
      success: () => {
        Taro.showToast({ title: '银行卡功能开发中', icon: 'none' });
      }
    });
  };

  const handleBill = () => {
    Taro.navigateTo({ url: '/pages/bill-detail/index' });
  };

  const handleAbout = () => {
    Taro.showModal({
      title: '关于钱包',
      content: '宠物寄养管家 v1.0.0\n\n为寄养家庭提供安全、便捷的收款服务',
      showCancel: false
    });
  };

  const handleFeedback = () => {
    Taro.showModal({
      title: '意见反馈',
      editable: true,
      placeholderText: '请输入您的建议或问题',
      success: (res) => {
        if (res.confirm && res.content) {
          console.log('[WalletSetting] 反馈:', res.content);
          Taro.showToast({ title: '感谢您的反馈', icon: 'success' });
        }
      }
    });
  };

  const handleClearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除缓存吗？不会删除您的个人数据',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '清理中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '清理完成', icon: 'success' });
          }, 800);
        }
      }
    });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmColor: '#ff5252',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>账户信息</Text>
        <View className={styles.settingItem} onClick={handlePwdSet}>
          <View className={styles.left}>
            <View className={styles.icon}>🔐</View>
            <View className={styles.info}>
              <Text className={styles.name}>支付密码</Text>
              <Text className={styles.desc}>设置后提现更安全</Text>
            </View>
          </View>
          <View className={styles.right}>
            <Text className={styles.value}>未设置</Text>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
        <View className={styles.settingItem} onClick={handleBankCard}>
          <View className={styles.left}>
            <View className={styles.icon}>💳</View>
            <View className={styles.info}>
              <Text className={styles.name}>收款账户</Text>
              <Text className={styles.desc}>管理微信/支付宝收款方式</Text>
            </View>
          </View>
          <View className={styles.right}>
            <Text className={styles.value}>2个账户</Text>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>账单设置</Text>
        <View className={styles.settingItem} onClick={handleBill}>
          <View className={styles.left}>
            <View className={styles.icon}>📊</View>
            <View className={styles.info}>
              <Text className={styles.name}>全部账单</Text>
              <Text className={styles.desc}>查看所有收支明细</Text>
            </View>
          </View>
          <View className={styles.right}>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
        <View className={styles.settingItem}>
          <View className={styles.left}>
            <View className={styles.icon}>🔔</View>
            <View className={styles.info}>
              <Text className={styles.name}>到账提醒</Text>
              <Text className={styles.desc}>有新的收款时通知</Text>
            </View>
          </View>
          <View className={styles.right}>
            <View
              className={classnames(styles.switch, { [styles.active]: notify })}
              onClick={() => setNotify(!notify)}
            />
          </View>
        </View>
        <View className={styles.settingItem}>
          <View className={styles.left}>
            <View className={styles.icon}>⚡</View>
            <View className={styles.info}>
              <Text className={styles.name}>自动接单</Text>
              <Text className={styles.desc}>有新订单时自动接受</Text>
            </View>
          </View>
          <View className={styles.right}>
            <View
              className={classnames(styles.switch, { [styles.active]: autoAccept })}
              onClick={() => setAutoAccept(!autoAccept)}
            />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>其他</Text>
        <View className={styles.settingItem} onClick={handleFeedback}>
          <View className={styles.left}>
            <View className={styles.icon}>💬</View>
            <View className={styles.info}>
              <Text className={styles.name}>意见反馈</Text>
              <Text className={styles.desc}>您的建议对我们很重要</Text>
            </View>
          </View>
          <View className={styles.right}>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
        <View className={styles.settingItem} onClick={handleClearCache}>
          <View className={styles.left}>
            <View className={styles.icon}>🗑️</View>
            <View className={styles.info}>
              <Text className={styles.name}>清除缓存</Text>
              <Text className={styles.desc}>释放存储空间</Text>
            </View>
          </View>
          <View className={styles.right}>
            <Text className={styles.value}>2.3MB</Text>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
        <View className={styles.settingItem} onClick={resetData}>
          <View className={styles.left}>
            <View className={styles.icon}>🔄</View>
            <View className={styles.info}>
              <Text className={styles.name}>重置数据</Text>
              <Text className={styles.desc}>恢复所有初始数据</Text>
            </View>
          </View>
          <View className={styles.right}>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
        <View className={styles.settingItem} onClick={handleAbout}>
          <View className={styles.left}>
            <View className={styles.icon}>ℹ️</View>
            <View className={styles.info}>
              <Text className={styles.name}>关于我们</Text>
              <Text className={styles.desc}>版本 v1.0.0</Text>
            </View>
          </View>
          <View className={styles.right}>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
      </View>

      <Button className={styles.logoutBtn} onClick={handleLogout}>
        退出登录
      </Button>
    </View>
  );
};

export default WalletSettingPage;
