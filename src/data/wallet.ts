import type { Wallet, IncomeRecord, Review, SitterSetting } from '@/types';

export const mockWallet: Wallet = {
  balance: 1280.5,
  pendingAmount: 540,
  totalIncome: 8620,
  monthIncome: 2340
};

export const mockIncomeRecords: IncomeRecord[] = [
  {
    id: '1',
    orderId: '4',
    orderNo: 'FY20250622004',
    petName: '橘座',
    amount: 300,
    type: 'income',
    status: 'completed',
    createTime: '2025-06-20 18:00'
  },
  {
    id: '2',
    orderId: '1',
    orderNo: 'FY20250622001',
    petName: '豆豆',
    amount: 240,
    type: 'income',
    status: 'pending',
    createTime: '2025-06-22 14:30'
  },
  {
    id: '3',
    orderId: '2',
    orderNo: 'FY20250622002',
    petName: '咪咪',
    amount: 300,
    type: 'income',
    status: 'pending',
    createTime: '2025-06-23 10:00'
  },
  {
    id: '4',
    orderId: '5',
    orderNo: 'FY20250622005',
    petName: '布丁',
    amount: 480,
    type: 'income',
    status: 'pending',
    createTime: '2025-06-25 09:00'
  },
  {
    id: '5',
    orderId: '6',
    orderNo: 'FY20250622006',
    petName: '雪球',
    amount: 60,
    type: 'income',
    status: 'completed',
    createTime: '2025-06-08 16:00'
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    orderId: '4',
    petName: '橘座',
    ownerName: '赵六',
    rating: 5,
    content: '非常专业的寄养服务！每天都能收到照片和视频，橘座回来状态很好，吃得好睡得香。下次还会再来！',
    createTime: '2025-06-21 10:30',
    reply: '感谢您的信任和好评，欢迎橘座常来玩~'
  },
  {
    id: '2',
    orderId: '6',
    petName: '雪球',
    ownerName: '周八',
    rating: 4,
    content: '整体不错，就是感觉猫咪瘦了一点点，可能是刚到新环境不太适应。服务还是很用心的。',
    createTime: '2025-06-13 15:00'
  },
  {
    id: '3',
    orderId: '3',
    petName: '旺财',
    ownerName: '王五',
    rating: 5,
    content: '超级棒！每天遛弯两次，旺财玩得很开心。寄养家庭很有爱心，强烈推荐！',
    createTime: '2025-06-16 09:00',
    reply: '谢谢夸奖，旺财也很可爱呢~'
  }
];

export const mockSitterSetting: SitterSetting = {
  acceptDog: true,
  acceptCat: true,
  dogBreeds: ['金毛', '柯基', '泰迪', '边牧'],
  catBreeds: ['布偶', '英短', '美短', '橘猫'],
  dailyCapacity: 5,
  dogPrice: 80,
  catPrice: 60,
  forbiddenConditions: ['烈性犬', '未打疫苗', '有传染病', '怀孕宠物'],
  availableDates: [],
  serviceItems: ['每日遛弯', '定时喂食', '实时照片', '24小时监控', '清洁美容', '紧急送医']
};

export const mockMonthlyIncome = [
  { month: '1月', income: 1800 },
  { month: '2月', income: 2200 },
  { month: '3月', income: 1950 },
  { month: '4月', income: 2400 },
  { month: '5月', income: 2100 },
  { month: '6月', income: 2340 }
];
