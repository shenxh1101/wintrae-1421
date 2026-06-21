import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date, format = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format);
};

export const formatMoney = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const getPetTypeText = (type: 'dog' | 'cat'): string => {
  return type === 'dog' ? '狗狗' : '猫咪';
};

export const getOrderStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待接单',
    accepted: '已接单',
    ongoing: '入住中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
};

export const getRecordTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    feed: '喂食',
    walk: '遛弯',
    medicine: '用药',
    photo: '照片',
    abnormal: '异常提醒',
    handover: '交接物品'
  };
  return typeMap[type] || type;
};

export const calcDays = (checkIn: string, checkOut: string): number => {
  const start = dayjs(checkIn);
  const end = dayjs(checkOut);
  return end.diff(start, 'day') || 1;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return dayjs(`${year}-${month + 1}`).daysInMonth();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return dayjs(`${year}-${month + 1}-01`).day();
};
