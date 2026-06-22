export type PetType = 'dog' | 'cat';

export type OrderStatus = 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';

export type RecordType = 'feed' | 'walk' | 'medicine' | 'photo' | 'abnormal' | 'handover';

export interface Vaccine {
  name: string;
  date: string;
  nextDate?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  weight: number;
  avatar: string;
  personalityTags: string[];
  dietHabit: string;
  vaccines: Vaccine[];
  emergencyContact: EmergencyContact;
  ownerName: string;
  ownerPhone: string;
  remark?: string;
  isRegular?: boolean;
}

export interface Order {
  id: string;
  orderNo: string;
  petId: string;
  petName: string;
  petType: PetType;
  petAvatar: string;
  ownerName: string;
  ownerPhone: string;
  checkInDate: string;
  checkOutDate: string;
  days: number;
  price: number;
  totalAmount: number;
  status: OrderStatus;
  deposit: number;
  createTime: string;
  remark?: string;
  handoverItems?: string[];
  cancelRule?: string;
  rescheduleRule?: string;
}

export interface CareRecord {
  id: string;
  orderId: string;
  petId: string;
  petName: string;
  type: RecordType;
  title: string;
  content: string;
  time: string;
  images?: string[];
  videos?: string[];
  isAbnormal?: boolean;
  abnormalDesc?: string;
}

export interface SitterSetting {
  acceptDog: boolean;
  acceptCat: boolean;
  dogBreeds?: string[];
  catBreeds?: string[];
  dailyCapacity: number;
  currentOccupancy: number;
  dogPrice: number;
  catPrice: number;
  forbiddenConditions: string[];
  availableDates: string[];
  serviceItems: string[];
}

export interface Wallet {
  balance: number;
  pendingAmount: number;
  totalIncome: number;
  monthIncome: number;
}

export interface IncomeRecord {
  id: string;
  orderId: string;
  orderNo: string;
  petName: string;
  amount: number;
  type: 'income' | 'withdraw';
  status: 'pending' | 'completed';
  createTime: string;
}

export interface Review {
  id: string;
  orderId: string;
  petName: string;
  ownerName: string;
  rating: number;
  content: string;
  createTime: string;
  reply?: string;
}
