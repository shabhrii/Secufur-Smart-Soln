export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },
  BUYER: {
    PRODUCTS: "/products",
    PRODUCT_DETAIL: (id: string) => `/product/${id}`,
    CART: "/cart",
    CHECKOUT: "/checkout",
  },
  SELLER: {
    HOME: "/seller",
    LOGIN: "/seller/login",
    REGISTER: "/seller/register",
    DASHBOARD: "/seller/dashboard",
  },
  ADMIN: {
    HOME: "/admin",
    DASHBOARD: "/admin/dashboard",
  },
} as const;
