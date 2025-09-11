import * as yup from 'yup';

export const createProductSchema = yup.object({
  name: yup.string().required('Nome do produto é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: yup.string().optional().max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  price: yup.number().optional().min(0, 'Preço deve ser um valor positivo'),
  category: yup.string().oneOf(['rings', 'necklaces', 'bags_purse', 'high_heeled_shoes'], 'Categoria inválida').required('Categoria é obrigatória')
});

export const updateProductSchema = yup.object({
  name: yup.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: yup.string().optional().max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  price: yup.number().optional().min(0, 'Preço deve ser um valor positivo'),
  category: yup.string().oneOf(['rings', 'necklaces', 'bags_purse', 'high_heeled_shoes'], 'Categoria inválida')
});

export const productIdSchema = yup.object({
  id: yup.number().required('ID do produto é obrigatório').positive('ID deve ser um número positivo')
});

export const productIdParamSchema = yup.object({
  productId: yup.number().required('ID do produto é obrigatório').positive('ID deve ser um número positivo')
});

export const imageIdSchema = yup.object({
  imageId: yup.number().required('ID da imagem é obrigatório').positive('ID deve ser um número positivo')
});
