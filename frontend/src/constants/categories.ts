export interface Category {
  value: string;
  label: string;
  icon: string;
}

export const PRODUCT_CATEGORIES: Category[] = [
  {
    value: 'rings',
    label: 'Anéis',
    icon: ''
  },
  {
    value: 'necklaces',
    label: 'Colares',
    icon: ''
  },
  {
    value: 'bags_purse',
    label: 'Bolsas',
    icon: ''
  },
  {
    value: 'high_heeled_shoes',
    label: 'Sapatos de Salto',
    icon: ''
  }
];

export const getCategoryLabel = (value: string): string => {
  const category = PRODUCT_CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value;
};

export const getCategoryIcon = (value: string): string => {
  const category = PRODUCT_CATEGORIES.find(cat => cat.value === value);
  return category ? category.icon : '';
};
