export const RISK_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  } as const;
  
  export type RiskLevel = (typeof RISK_LEVELS)[keyof typeof RISK_LEVELS];
  export const RISK_LEVEL_VALUES = Object.values(RISK_LEVELS) as RiskLevel[];