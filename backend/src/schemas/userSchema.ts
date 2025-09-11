import * as yup from 'yup';

export const createUserSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  mail: yup.string().required('Email é obrigatório').email('Formato de email inválido'),
  login: yup.string().required('Login é obrigatório').min(3, 'Login deve ter pelo menos 3 caracteres'),
  password: yup.string().required('Senha é obrigatória').min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: yup.string().oneOf(['admin', 'customer'], 'Role deve ser admin ou customer'),
  // Campos opcionais para customer
  phone: yup.string().matches(/^[0-9+\-\s()]+$/, 'Formato de telefone inválido'),
  address: yup.string().min(10, 'Endereço deve ter pelo menos 10 caracteres'),
  zip_code: yup.string().matches(/^[0-9]{5}-?[0-9]{3}$/, 'Formato de CEP inválido'),
  document: yup.string(),
  neighborhood: yup.string().min(2, 'Bairro deve ter pelo menos 2 caracteres'),
  city: yup.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: yup.string().length(2, 'Estado deve ter exatamente 2 caracteres (sigla)'),
  address_number: yup.string().min(1, 'Número do endereço é obrigatório')
});

export const updateUserSchema = yup.object({
  name: yup.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  mail: yup.string().email('Formato de email inválido'),
  login: yup.string().min(3, 'Login deve ter pelo menos 3 caracteres'),
  password: yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: yup.string().oneOf(['admin', 'customer'], 'Role deve ser admin ou customer'),
  // Campos opcionais para customer
  phone: yup.string().matches(/^[0-9+\-\s()]+$/, 'Formato de telefone inválido'),
  address: yup.string().min(10, 'Endereço deve ter pelo menos 10 caracteres'),
  zip_code: yup.string().matches(/^[0-9]{5}-?[0-9]{3}$/, 'Formato de CEP inválido'),
  document: yup.string(),
  neighborhood: yup.string().min(2, 'Bairro deve ter pelo menos 2 caracteres'),
  city: yup.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: yup.string().length(2, 'Estado deve ter exatamente 2 caracteres (sigla)'),
  address_number: yup.string().min(1, 'Número do endereço é obrigatório')
});

export const loginSchema = yup.object({
  login: yup.string().required('Login é obrigatório'),
  password: yup.string().required('Senha é obrigatória')
});

export const userIdSchema = yup.object({
  id: yup.number().required('ID do usuário é obrigatório').positive('ID deve ser um número positivo')
});