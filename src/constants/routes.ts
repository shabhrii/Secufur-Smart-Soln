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
    ORDERS: "/orders",
    ORDER_DETAIL: (id: string) => `/orders/${id}`,
  },
  SELLER: {
    HOME: "/seller",
    LOGIN: "/seller/login",
    REGISTER: "/seller/register",
    DASHBOARD: "/seller/dashboard",
    ORDERS: "/seller/orders",
  },
  ADMIN: {
    HOME: "/admin",
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    SELLERS: "/admin/sellers",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
    SETTINGS: "/admin/settings",
  },
} as const;

