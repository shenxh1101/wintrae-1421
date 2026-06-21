import type { CareRecord } from '@/types';

export const mockRecords: CareRecord[] = [
  {
    id: '1',
    orderId: '1',
    petId: '1',
    petName: '豆豆',
    type: 'feed',
    title: '早餐喂食',
    content: '喂了150g狗粮，吃得很香，全部吃完了',
    time: '2025-06-22 08:30',
    images: ['https://picsum.photos/id/237/400/300']
  },
  {
    id: '2',
    orderId: '1',
    petId: '1',
    petName: '豆豆',
    type: 'walk',
    title: '早晨遛弯',
    content: '遛了30分钟，排便正常，精神状态很好',
    time: '2025-06-22 09:00',
    images: ['https://picsum.photos/id/169/400/300', 'https://picsum.photos/id/1062/400/300']
  },
  {
    id: '3',
    orderId: '1',
    petId: '1',
    petName: '豆豆',
    type: 'medicine',
    title: '补充维生素',
    content: '按医嘱喂了一片复合维生素',
    time: '2025-06-22 10:00'
  },
  {
    id: '4',
    orderId: '1',
    petId: '1',
    petName: '豆豆',
    type: 'photo',
    title: '午睡时光',
    content: '豆豆睡得好香呀，毛茸茸的太可爱了',
    time: '2025-06-22 13:30',
    images: ['https://picsum.photos/id/237/400/400', 'https://picsum.photos/id/1062/400/400']
  },
  {
    id: '5',
    orderId: '1',
    petId: '1',
    petName: '豆豆',
    type: 'abnormal',
    title: '轻微皮肤发红',
    content: '发现豆豆腹部有一小块皮肤发红，已联系主人确认，可能是对草地过敏，已涂抹药膏',
    time: '2025-06-22 15:00',
    isAbnormal: true,
    abnormalDesc: '腹部皮肤轻微发红，疑似过敏'
  },
  {
    id: '6',
    orderId: '1',
    petId: '1',
    petName: '豆豆',
    type: 'feed',
    title: '晚餐喂食',
    content: '喂了150g狗粮，食欲正常',
    time: '2025-06-22 18:00'
  },
  {
    id: '7',
    orderId: '1',
    petId: '1',
    petName: '豆豆',
    type: 'walk',
    title: '晚间遛弯',
    content: '遛了40分钟，状态很好，玩得很开心',
    time: '2025-06-22 19:30'
  },
  {
    id: '8',
    orderId: '1',
    petId: '1',
    petName: '豆豆',
    type: 'handover',
    title: '交接物品确认',
    content: '已确认收到：狗粮一袋、牵引绳、食盆水盆、玩具一个',
    time: '2025-06-22 20:00'
  },
  {
    id: '9',
    orderId: '4',
    petId: '4',
    petName: '橘座',
    type: 'feed',
    title: '早餐喂食',
    content: '喂了40g猫粮，吃完了，食欲不错',
    time: '2025-06-18 09:00'
  },
  {
    id: '10',
    orderId: '4',
    petId: '4',
    petName: '橘座',
    type: 'photo',
    title: '晒太阳',
    content: '橘座在阳台晒太阳，好惬意呀',
    time: '2025-06-18 14:00',
    images: ['https://picsum.photos/id/1025/400/300']
  }
];
