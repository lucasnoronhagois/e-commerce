import * as yup from 'yup';

// Função para validar CPF
const isValidCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.charAt(10));
};

// Função para validar CPF
const isValidDocument = (document: string): boolean => {
  const cleanDoc = document.replace(/[^\d]/g, '');
  if (cleanDoc.length === 11) {
    return isValidCPF(document);
  }
  return false;
};

export const createCustomerSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: yup.string().required('Telefone é obrigatório').matches(/^[0-9+\-\s()]+$/, 'Formato de telefone inválido'),
  mail: yup.string().required('Email é obrigatório').email('Formato de email inválido'),
  login: yup.string().required('Login é obrigatório').min(3, 'Login deve ter pelo menos 3 caracteres'),
  password: yup.string().required('Senha é obrigatória').min(6, 'Senha deve ter pelo menos 6 caracteres'),
  address: yup.string().required('Endereço é obrigatório').min(10, 'Endereço deve ter pelo menos 10 caracteres'),
  zip_code: yup.string().required('CEP é obrigatório').matches(/^[0-9]{5}-?[0-9]{3}$/, 'Formato de CEP inválido'),
  document: yup.string().required('CPF é obrigatório').test('is-valid-document', 'CPF inválido', function(value) {
    return isValidDocument(value);
  }),
  neighborhood: yup.string().required('Bairro é obrigatório').min(2, 'Bairro deve ter pelo menos 2 caracteres'),
  city: yup.string().required('Cidade é obrigatória').min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: yup.string().required('Estado é obrigatório').length(2, 'Estado deve ter exatamente 2 caracteres (sigla)'),
  address_number: yup.string().required('Número do endereço é obrigatório').min(1, 'Número do endereço é obrigatório')
});

export const updateCustomerSchema = yup.object({
  name: yup.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: yup.string().test('phone-validation', 'Formato de telefone inválido', function(value) {
    if (!value) return true; // Campo opcional
    return /^[0-9+\-\s()]+$/.test(value);
  }),
  mail: yup.string().email('Formato de email inválido'),
  login: yup.string().min(3, 'Login deve ter pelo menos 3 caracteres'),
  password: yup.string().test('password-validation', 'Senha deve ter pelo menos 6 caracteres', function(value) {
    if (!value) return true; // Campo opcional na atualização
    return value.length >= 6;
  }),
  address: yup.string().test('address-validation', 'Endereço deve ter pelo menos 10 caracteres', function(value) {
    if (!value) return true; // Campo opcional
    return value.length >= 10;
  }),
  zip_code: yup.string().test('zip-validation', 'Formato de CEP inválido', function(value) {
    if (!value) return true; // Campo opcional
    return /^[0-9]{5}-?[0-9]{3}$/.test(value);
  }),
  document: yup.string().test('is-valid-document', 'CPF inválido', function(value) {
    if (!value) return true; // Campo opcional na atualização
    return isValidDocument(value);
  }),
  neighborhood: yup.string().test('neighborhood-validation', 'Bairro deve ter pelo menos 2 caracteres', function(value) {
    if (!value) return true; // Campo opcional
    return value.length >= 2;
  }),
  city: yup.string().test('city-validation', 'Cidade deve ter pelo menos 2 caracteres', function(value) {
    if (!value) return true; // Campo opcional
    return value.length >= 2;
  }),
  state: yup.string().test('state-validation', 'Estado deve ter exatamente 2 caracteres (sigla)', function(value) {
    if (!value) return true; // Campo opcional
    return value.length === 2;
  }),
  address_number: yup.string().test('address-number-validation', 'Número do endereço é obrigatório', function(value) {
    if (!value) return true; // Campo opcional
    return value.length >= 1;
  })
});

export const customerLoginSchema = yup.object({
  login: yup.string().required('Login é obrigatório'),
  password: yup.string().required('Senha é obrigatória')
});

export const customerIdSchema = yup.object({
  id: yup.number().required('ID do cliente é obrigatório').positive('ID deve ser um número positivo')
});
