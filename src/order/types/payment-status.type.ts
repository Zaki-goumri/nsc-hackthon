export const PAYMENT_STATUSES = {
    PENDING: 'pending',
    PAID: 'paid',
    REFUNDED: 'refunded',
    FAILED: 'failed',
  } as const;
  
  export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
  export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUSES) as PaymentStatus[];