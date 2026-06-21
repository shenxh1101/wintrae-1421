import type { Pet } from '@/types';

export const mockPets: Pet[] = [
  {
    id: '1',
    name: '豆豆',
    type: 'dog',
    breed: '金毛寻回犬',
    age: 3,
    gender: 'male',
    weight: 28,
    avatar: 'https://picsum.photos/id/237/200/200',
    personalityTags: ['温顺', '亲人', '活泼'],
    dietHabit: '每日两餐，早晚各一次，每次150g狗粮，不吃鸡骨头',
    vaccines: [
      { name: '狂犬疫苗', date: '2025-03-15', nextDate: '2026-03-15' },
      { name: '六联疫苗', date: '2025-04-10', nextDate: '2026-04-10' }
    ],
    emergencyContact: { name: '张三', phone: '138****8888', relation: '主人' },
    ownerName: '张三',
    ownerPhone: '138****8888',
    remark: '对花粉过敏，春天需要注意',
    isRegular: true
  },
  {
    id: '2',
    name: '咪咪',
    type: 'cat',
    breed: '布偶猫',
    age: 2,
    gender: 'female',
    weight: 4.5,
    avatar: 'https://picsum.photos/id/659/200/200',
    personalityTags: ['高冷', '粘人', '爱干净'],
    dietHabit: '自由采食，猫粮随时有，每天一小罐湿粮',
    vaccines: [
      { name: '狂犬疫苗', date: '2025-05-20', nextDate: '2026-05-20' },
      { name: '猫三联', date: '2025-06-01', nextDate: '2026-06-01' }
    ],
    emergencyContact: { name: '李四', phone: '139****9999', relation: '主人' },
    ownerName: '李四',
    ownerPhone: '139****9999',
    remark: '胆子小，陌生人来会躲起来',
    isRegular: true
  },
  {
    id: '3',
    name: '旺财',
    type: 'dog',
    breed: '柯基',
    age: 4,
    gender: 'male',
    weight: 12,
    avatar: 'https://picsum.photos/id/718/200/200',
    personalityTags: ['贪吃', '活泼', '护食'],
    dietHabit: '每日三餐，早中晚，每次100g，饭后遛弯',
    vaccines: [
      { name: '狂犬疫苗', date: '2025-02-10', nextDate: '2026-02-10' }
    ],
    emergencyContact: { name: '王五', phone: '137****7777', relation: '主人' },
    ownerName: '王五',
    ownerPhone: '137****7777',
    remark: '不能吃太多，会发胖',
    isRegular: false
  },
  {
    id: '4',
    name: '橘座',
    type: 'cat',
    breed: '橘猫',
    age: 5,
    gender: 'male',
    weight: 6.8,
    avatar: 'https://picsum.photos/id/1025/200/200',
    personalityTags: ['懒', '贪吃', '亲人'],
    dietHabit: '控制饮食，每天80g猫粮，分两次喂',
    vaccines: [
      { name: '狂犬疫苗', date: '2025-01-15', nextDate: '2026-01-15' },
      { name: '猫三联', date: '2025-03-20', nextDate: '2026-03-20' }
    ],
    emergencyContact: { name: '赵六', phone: '136****6666', relation: '主人' },
    ownerName: '赵六',
    ownerPhone: '136****6666',
    remark: '需要减肥，不要额外喂零食',
    isRegular: false
  },
  {
    id: '5',
    name: '布丁',
    type: 'dog',
    breed: '泰迪',
    age: 2,
    gender: 'female',
    weight: 5,
    avatar: 'https://picsum.photos/id/1074/200/200',
    personalityTags: ['粘人', '爱叫', '聪明'],
    dietHabit: '每日两餐，早晚各50g，配湿粮',
    vaccines: [
      { name: '狂犬疫苗', date: '2025-06-01', nextDate: '2026-06-01' }
    ],
    emergencyContact: { name: '孙七', phone: '135****5555', relation: '主人' },
    ownerName: '孙七',
    ownerPhone: '135****5555',
    remark: '需要每天梳毛，防止打结',
    isRegular: true
  },
  {
    id: '6',
    name: '雪球',
    type: 'cat',
    breed: '银渐层',
    age: 1,
    gender: 'female',
    weight: 3.2,
    avatar: 'https://picsum.photos/id/783/200/200',
    personalityTags: ['好奇', '活泼', '爱玩'],
    dietHabit: '每日三餐，每次30g猫粮，羊奶粉加餐',
    vaccines: [
      { name: '猫三联', date: '2025-07-10', nextDate: '2026-07-10' }
    ],
    emergencyContact: { name: '周八', phone: '134****4444', relation: '主人' },
    ownerName: '周八',
    ownerPhone: '134****4444',
    remark: '刚满一岁，还比较调皮',
    isRegular: false
  }
];
