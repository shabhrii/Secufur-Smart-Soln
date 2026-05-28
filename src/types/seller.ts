export enum SellerVerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  description?: string;
  verificationStatus: SellerVerificationStatus;
  createdAt: string;
  updatedAt: string;
}
