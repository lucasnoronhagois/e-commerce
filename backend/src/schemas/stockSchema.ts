import * as yup from 'yup';

export const createStockSchema = yup.object({
  product_id: yup.number().required('ID do produto é obrigatório').positive('ID deve ser um número positivo'),
  quantity: yup.number().required('Quantidade é obrigatória').min(0, 'Quantidade não pode ser negativa')
});

export const updateStockSchema = yup.object({
  quantity: yup.number().min(0, 'Quantidade não pode ser negativa')
});

export const stockIdSchema = yup.object({
  id: yup.number().required('ID do estoque é obrigatório').positive('ID deve ser um número positivo')
});

export const productIdParamSchema = yup.object({
  product_id: yup.number().required('ID do produto é obrigatório').positive('ID deve ser um número positivo')
});
