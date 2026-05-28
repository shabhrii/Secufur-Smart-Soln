export const APP_CONFIG = {
  NAME: "Secufur",
  DESCRIPTION: "The Next Generation Marketplace Foundation",
  SUPPORT_EMAIL: "support@secufur.com",
  CURRENCY: "USD",
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  }
} as const;
