import { SecurityMode } from './security';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  isConfirmed: boolean;
  confirmationCode: string;
  storeCredit: number; // الرصيد المتجر بالجنيه للشراء
  phone?: string;
  address?: string;
  city?: string;
  governorate?: string;
  createdAt: string;
  isLocked?: boolean;
  lockUntil?: number;
  failedAttempts?: number;
  securityMode?: SecurityMode; // وضع الأمان المخصص لهذا المستخدم ('secure' | 'naive')
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}
