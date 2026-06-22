import React, { useState } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import { generateId } from '@/utils';
import classnames from 'classnames';
import type { PaymentAccount } from '@/types';

const AccountManagePage: React.FC = () => {
  const { paymentAccounts, addPaymentAccount, updatePaymentAccount, deletePaymentAccount, setDefaultAccount } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [accountType, setAccountType] = useState<'wechat' | 'alipay'>('wechat');
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [showActionSheet, setShowActionSheet] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingAccount(null);
    setAccountType('wechat');
    setName('');
    setAccount('');
    setIsDefault(false);
    setShowAddModal(true);
  };

  const handleEdit = (acc: PaymentAccount) => {
    setEditingAccount(acc);
    setAccountType(acc.type);
    setName(acc.name);
    setAccount(acc.account);
    setIsDefault(acc.isDefault);
    setShowAddModal(true);
  };

  const handleCardClick = (acc: PaymentAccount) => {
    setShowActionSheet(acc.id);
  };

  const handleSetDefault = (acc: PaymentAccount) => {
    if (!acc.isDefault) {
      setDefaultAccount(acc.id);
      Taro.showToast({ title: '已设为默认', icon: 'success' });
    }
    setShowActionSheet(null);
  };

  const handleDelete = (acc: PaymentAccount) => {
    Taro.showModal({
      title: '删除账户',
      content: `确定删除${acc.type === 'wechat' ? '微信' : '支付宝'}账户吗？`,
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          deletePaymentAccount(acc.id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
    setShowActionSheet(null);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!account.trim()) {
      Taro.showToast({ title: '请输入账号', icon: 'none' });
      return;
    }

    const accountData = {
      type: accountType,
      name: name.trim(),
      account: account.trim(),
      isDefault
    };

    if (editingAccount) {
      updatePaymentAccount(editingAccount.id, accountData);
      Taro.showToast({ title: '修改成功', icon: 'success' });
    } else {
      addPaymentAccount(accountData);
      Taro.showToast({ title: '添加成功', icon: 'success' });
    }

    setShowAddModal(false);
  };

  return (
    <View className={styles.page}>
      <Text className={styles.sectionTitle}>已绑定账户</Text>

      {paymentAccounts.length === 0 ? (
        <View className={styles.empty}>
          <Text className={styles.icon}>💳</Text>
          <Text className={styles.text}>暂无收款账户</Text>
        </View>
      ) : (
        paymentAccounts.map((acc) => (
          <React.Fragment key={acc.id}>
            <View
              className={styles.accountCard}
              onClick={() => handleCardClick(acc)}
            >
              <View className={classnames(styles.icon, acc.type)}>
                {acc.type === 'wechat' ? '💬' : '💰'}
              </View>
              <View className={styles.info}>
                <Text className={styles.name}>
                  {acc.name} · {acc.type === 'wechat' ? '微信钱包' : '支付宝'}
                </Text>
                <Text className={styles.account}>{acc.account}</Text>
              </View>
              <View className={styles.right}>
                {acc.isDefault && <Text className={styles.defaultTag}>默认</Text>}
                <Text className={styles.arrow}>›</Text>
              </View>
            </View>

            {showActionSheet === acc.id && (
              <View className={styles.modalMask} onClick={() => setShowActionSheet(null)}>
                <View className={styles.actionSheet} onClick={(e) => e.stopPropagation()}>
                  <Button
                    className={classnames(styles.actionItem)}
                    onClick={() => handleSetDefault(acc)}
                  >
                    {acc.isDefault ? '取消默认' : '设为默认'}
                  </Button>
                  <Button
                    className={styles.actionItem}
                    onClick={() => {
                      setShowActionSheet(null);
                      handleEdit(acc);
                    }}
                  >
                    编辑账户
                  </Button>
                  <Button
                    className={classnames(styles.actionItem, styles.danger)}
                    onClick={() => handleDelete(acc)}
                  >
                    删除账户
                  </Button>
                  <Button
                    className={classnames(styles.actionItem, styles.cancel)}
                    onClick={() => setShowActionSheet(null)}
                  >
                    取消
                  </Button>
                </View>
              </View>
            )}
          </React.Fragment>
        ))
      )}

      <Button className={styles.addBtn} onClick={handleAdd}>
        + 添加收款账户
      </Button>

      {showAddModal && (
        <View className={styles.modalMask} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              {editingAccount ? '编辑收款账户' : '添加收款账户'}
            </Text>

            <View className={styles.typeTabs}>
              <Button
                className={classnames(styles.tab, { [styles.active]: accountType === 'wechat' })}
                onClick={() => setAccountType('wechat')}
              >
                💬 微信
              </Button>
              <Button
                className={classnames(styles.tab, { [styles.active]: accountType === 'alipay' })}
                onClick={() => setAccountType('alipay')}
              >
                💰 支付宝
              </Button>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>真实姓名</Text>
              <Input
                className={styles.input}
                placeholder='请输入真实姓名'
                value={name}
                onInput={(e) => setName(e.detail.value)}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>{accountType === 'wechat' ? '微信号' : '支付宝账号'}</Text>
              <Input
                className={styles.input}
                placeholder={`请输入${accountType === 'wechat' ? '微信号' : '支付宝账号'}`}
                value={account}
                onInput={(e) => setAccount(e.detail.value)}
              />
            </View>

            <View className={styles.defaultRow}>
              <Text className={styles.label}>设为默认收款账户</Text>
              <View
                className={classnames(styles.switch, { [styles.active]: isDefault })}
                onClick={() => setIsDefault(!isDefault)}
              />
            </View>

            <View className={styles.modalBtns}>
              <Button
                className={classnames(styles.btn, styles.cancel)}
                onClick={() => setShowAddModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.btn, styles.confirm)}
                onClick={handleSave}
              >
                保存
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AccountManagePage;
