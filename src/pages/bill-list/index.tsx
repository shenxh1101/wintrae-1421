import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import { formatMoney } from '@/utils';
import classnames from 'classnames';
import type { IncomeRecord } from '@/types';

type FilterType = 'all' | 'income' | 'withdraw';

const BillListPage: React.FC = () => {
  const { incomeRecords, orders } = useAppContext();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredRecords = useMemo(() => {
    let records = [...incomeRecords];
    if (filter === 'income') {
      records = records.filter((r) => r.type === 'income');
    } else if (filter === 'withdraw') {
      records = records.filter((r) => r.type === 'withdraw');
    }
    return records.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  }, [incomeRecords, filter]);

  const groupedRecords = useMemo(() => {
    const groups: { [key: string]: IncomeRecord[] } = {};
    filteredRecords.forEach((record) => {
      const date = record.createTime.split(' ')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });
    return groups;
  }, [filteredRecords]);

  const stats = useMemo(() => {
    const totalIncome = incomeRecords
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);
    const totalWithdraw = incomeRecords
      .filter((r) => r.type === 'withdraw')
      .reduce((sum, r) => sum + r.amount, 0);
    return { totalIncome, totalWithdraw };
  }, [incomeRecords]);

  const handleItemClick = (record: IncomeRecord) => {
    console.log('[BillList] 点击账单:', record.orderNo);
    Taro.navigateTo({ url: `/pages/bill-detail/index?id=${record.id}` });
  };

  const getStatusText = (record: IncomeRecord) => {
    if (record.status === 'pending') {
      return record.type === 'income' ? '待结算' : '处理中';
    }
    return record.type === 'income' ? '已到账' : '已到账';
  };

  const getDailyTotal = (records: IncomeRecord[]) => {
    const income = records.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const withdraw = records.filter((r) => r.type === 'withdraw').reduce((sum, r) => sum + r.amount, 0);
    return { income, withdraw };
  };

  return (
    <View className={styles.page}>
      <View className={styles.summaryCard}>
        <View className={styles.stat}>
          <Text className={styles.label}>累计收入</Text>
          <Text className={styles.value}>{formatMoney(stats.totalIncome)}</Text>
        </View>
        <View className={styles.stat}>
          <Text className={styles.label}>累计提现</Text>
          <Text className={styles.value}>{formatMoney(stats.totalWithdraw)}</Text>
        </View>
      </View>

      <View className={styles.filterTabs}>
        <Button
          className={classnames(styles.tab, { [styles.active]: filter === 'all' })}
          onClick={() => setFilter('all')}
        >
          全部
        </Button>
        <Button
          className={classnames(styles.tab, { [styles.active]: filter === 'income' })}
          onClick={() => setFilter('income')}
        >
          寄养收入
        </Button>
        <Button
          className={classnames(styles.tab, { [styles.active]: filter === 'withdraw' })}
          onClick={() => setFilter('withdraw')}
        >
          提现记录
        </Button>
      </View>

      {Object.keys(groupedRecords).length === 0 ? (
        <View className={styles.empty}>
          <Text className={styles.icon}>📊</Text>
          <Text className={styles.text}>暂无{filter === 'all' ? '' : filter === 'income' ? '收入' : '提现'}记录</Text>
        </View>
      ) : (
        Object.entries(groupedRecords).map(([date, records]) => {
          const dailyTotal = getDailyTotal(records);
          return (
            <View key={date} className={styles.dateGroup}>
              <View className={styles.dateHeader}>
                <Text className={styles.date}>{date}</Text>
                <Text className={styles.total}>
                  {dailyTotal.income > 0 && (
                    <Text className={styles.incomeAmount}>+{formatMoney(dailyTotal.income)} </Text>
                  )}
                  {dailyTotal.withdraw > 0 && (
                    <Text className={styles.withdrawAmount}>-{formatMoney(dailyTotal.withdraw)}</Text>
                  )}
                </Text>
              </View>

              {records.map((record) => (
                <View
                  key={record.id}
                  className={styles.billItem}
                  onClick={() => handleItemClick(record)}
                >
                  <View className={classnames(styles.icon, record.type)}>
                    {record.type === 'income' ? '🐾' : '💸'}
                  </View>
                  <View className={styles.info}>
                    <Text className={styles.title}>{record.petName}</Text>
                    <Text className={styles.subInfo}>{record.orderNo} · {record.createTime.split(' ')[1]}</Text>
                  </View>
                  <View className={styles.right}>
                    <Text className={classnames(styles.amount, record.type)}>
                      {record.type === 'income' ? '+' : '-'}{formatMoney(record.amount)}
                    </Text>
                    <Text className={classnames(styles.status, record.status)}>
                      {getStatusText(record)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })
      )}
    </View>
  );
};

export default BillListPage;
