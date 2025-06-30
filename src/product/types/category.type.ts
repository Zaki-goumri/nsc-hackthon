export const CATEGORIES = {
    APPAREL :'apparel',
  ELECTRONICS : 'electronics',
  HOME : 'home',
  BEAUTY : 'beauty',
  SPORTS : 'sports',
  TOYS : 'toys',
  FOOD : 'food',
  BOOKS : 'books',
  OTHER : 'other',
  } as const;
  
  export type ProductCategory = (typeof CATEGORIES)[keyof typeof CATEGORIES];
  
  export const CATEGORIES_VALUES = Object.values(CATEGORIES) as ProductCategory[];
  