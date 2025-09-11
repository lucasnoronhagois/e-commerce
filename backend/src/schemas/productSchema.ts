import * as yup from 'yup';

export const createProductSchema = yup.object({
  name: yup.string().required('Nome do produto é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres')
});

export const updateProductSchema = yup.object({
  name: yup.string().min(2, 'Nome deve ter pelo menos 2 caracteres')
});

export const productIdSchema = yup.object({
  id: yup.number().required('ID do produto é obrigatório').positive('ID deve ser um número positivo')
});
