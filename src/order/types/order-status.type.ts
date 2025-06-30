export const ORDER_STATUSES = {
    NEW: 'new',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    RETURN_REQUESTED: 'return_requested',
    REFUNDED: 'refunded',
  } as const;
  
  export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];
  export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUSES) as OrderStatus[];