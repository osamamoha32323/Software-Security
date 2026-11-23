export interface Coupon {
  id: string;
  code: string;
  discountPercent: number; // e.g., 15 for 15%
  maxDiscount?: number;
  minOrderAmount: number;
  expiryDate: string; // ISO string
  usedByUsers: string[]; // IDs of users who redeemed this coupon
  isActive: boolean;
  isSingleUsePerUser: boolean;
  descriptionAr: string;
}
