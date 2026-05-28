export enum ProductStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  status: ProductStatus;
  inventoryCount: number;
  createdAt: string;
  updatedAt: string;
}
