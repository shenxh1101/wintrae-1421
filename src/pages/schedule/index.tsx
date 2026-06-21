import React, { useState, useMemo } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockOrders } from '@/data/orders';
import type { Order } from '@/types';
import { formatDate } from '@/utils';
import classnames from 'classnames';
import dayjs from 'dayjs';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const SchedulePage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [orders] = useState<Order[]>(mockOrders);

  const today = dayjs();

  const calendarDays = useMemo(() => {
    const year = currentMonth.year();
    const month = currentMonth.month();

    const firstDay = dayjs(`${year}-${month + 1}-01`);
    const daysInMonth = firstDay.daysInMonth();
    const startWeekday = firstDay.day();

    const days: { date: dayjs.Dayjs; isCurrentMonth: boolean }[] = [];

    const prevMonth = firstDay.subtract(1, 'month');
    const prevMonthDays = prevMonth.daysInMonth();
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push({
        date: dayjs(`${year}-${month}-${prevMonthDays - i}`),
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: dayjs(`${year}-${month + 1}-${i}`),
        isCurrentMonth: true
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: dayjs(`${year}-${month + 2}-${i}`),
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentMonth]);

  const getDayOrders = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return orders.filter((order) => {
      if (order.status === 'cancelled') return false;
      return dateStr >= order.checkInDate && dateStr < order.checkOutDate;
    });
  };

  const getDayDots = (date: dayjs.Dayjs) => {
    const dayOrders = getDayOrders(date);
    const dots: { type: string }[] = [];

    dayOrders.forEach((order) => {
      if (order.status === 'ongoing') {
        if (!dots.find((d) => d.type === 'ongoing')) {
          dots.push({ type: 'ongoing' });
        }
      } else if (order.status === 'accepted' || order.status === 'pending') {
        if (!dots.find((d) => d.type === 'upcoming')) {
          dots.push({ type: 'upcoming' });
        }
      }
    });

    return dots.slice(0, 2);
  };

  const selectedDayOrders = useMemo(() => {
    return getDayOrders(selectedDate);
  }, [selectedDate, orders]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  };

  const handleToday = () => {
    setCurrentMonth(dayjs());
    setSelectedDate(dayjs());
  };

  const handleDateClick = (date: dayjs.Dayjs) => {
    setSelectedDate(date);
    console.log('[Schedule] 选择日期:', date.format('YYYY-MM-DD'));
  };

  const handlePetClick = (order: Order) => {
    console.log('[Schedule] 查看订单:', order.orderNo);
    Taro.showToast({ title: '订单详情开发中', icon: 'none' });
  };

  const isToday = (date: dayjs.Dayjs) => {
    return date.format('YYYY-MM-DD') === today.format('YYYY-MM-DD');
  };

  const isSelected = (date: dayjs.Dayjs) => {
    return date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
  };

  const getOrderStatusForDate = (order: Order, date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    if (dateStr === order.checkOutDate) return 'checkout';
    if (order.status === 'ongoing') return 'ongoing';
    return 'upcoming';
  };

  const statusTextMap: Record<string, string> = {
    ongoing: '入住中',
    upcoming: '待入住',
    checkout: '今日离店'
  };

  return (
    <View className={styles.page}>
      <View className={styles.calendarCard}>
        <View className={styles.calendarHeader}>
          <Text className={styles.monthText}>
            {currentMonth.format('YYYY年MM月')}
          </Text>
          <View className={styles.navBtns}>
            <Button className={styles.navBtn} onClick={handlePrevMonth}>
              ‹
            </Button>
            <Button className={styles.todayBtn} onClick={handleToday}>
              今天
            </Button>
            <Button className={styles.navBtn} onClick={handleNextMonth}>
              ›
            </Button>
          </View>
        </View>

        <View className={styles.weekDays}>
          {weekDays.map((day) => (
            <Text key={day} className={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        <View className={styles.daysGrid}>
          {calendarDays.map((day, idx) => {
            const dots = getDayDots(day.date);
            return (
              <View
                key={idx}
                className={classnames(styles.dayCell, {
                  [styles.selected]: isSelected(day.date),
                  [styles.today]: isToday(day.date),
                  [styles.otherMonth]: !day.isCurrentMonth
                })}
                onClick={() => handleDateClick(day.date)}
              >
                <Text className={styles.dayNum}>{day.date.date()}</Text>
                <View className={styles.dots}>
                  {dots.map((dot, dotIdx) => (
                    <View
                      key={dotIdx}
                      className={classnames(styles.dot, styles[dot.type])}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <View className={styles.legend}>
          <View className={styles.legendItem}>
            <View className={classnames(styles.dot, styles.ongoing)} />
            <Text className={styles.text}>入住中</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.dot, styles.upcoming)} />
            <Text className={styles.text}>待入住</Text>
          </View>
        </View>
      </View>

      <View className={styles.daySummary}>
        <Text className={styles.dateText}>
          {selectedDate.format('M月D日 dddd')}
        </Text>
        <Text className={styles.capacity}>
          入住 <Text className={styles.num}>{selectedDayOrders.length}</Text> / 5 只
        </Text>
      </View>

      <Text className={styles.sectionTitle}>当日入住宠物</Text>

      <ScrollView scrollY style={{ height: 'calc(100vh - 720rpx)' }}>
        <View className={styles.petList}>
          {selectedDayOrders.length > 0 ? (
            selectedDayOrders.map((order) => {
              const status = getOrderStatusForDate(order, selectedDate);
              return (
                <View
                  key={order.id}
                  className={styles.miniPetCard}
                  onClick={() => handlePetClick(order)}
                >
                  <Image
                    className={styles.avatar}
                    src={order.petAvatar}
                    mode="aspectFill"
                  />
                  <View className={styles.info}>
                    <Text className={styles.name}>
                      {order.petName}
                      <Text style={{ fontSize: '22rpx', color: '#9c8c7e' }}>
                        · {order.ownerName}
                      </Text>
                    </Text>
                    <Text className={styles.dates}>
                      {formatDate(order.checkInDate)} → {formatDate(order.checkOutDate)}（{order.days}晚）
                    </Text>
                  </View>
                  <Text className={classnames(styles.status, styles[status])}>
                    {statusTextMap[status]}
                  </Text>
                </View>
              );
            })
          ) : (
            <View className={styles.empty}>
              <Text className={styles.icon}>📅</Text>
              <Text className={styles.text}>当天没有入住安排</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SchedulePage;
