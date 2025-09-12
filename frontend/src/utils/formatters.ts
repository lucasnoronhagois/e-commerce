// Utilitários de formatação para campos de formulário

/**
 * Formata um número de telefone brasileiro
 * @param value - Valor do telefone (apenas números)
 * @returns Telefone formatado (11) 99999-9999 ou (11) 9999-9999
 */
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  
  // Limitar a 11 dígitos
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Formata um CEP brasileiro
 * @param value - Valor do CEP (apenas números)
 * @returns CEP formatado 00000-000
 */
export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 5) return numbers;
  if (numbers.length <= 8) return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
  
  // Limitar a 8 dígitos
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

/**
 * Remove toda formatação de um valor (apenas números)
 * @param value - Valor formatado
 * @returns Valor apenas com números
 */
export const removeFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Valida se um telefone brasileiro é válido
 * @param phone - Telefone (com ou sem formatação)
 * @returns true se válido, false caso contrário
 */
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = removeFormatting(phone);
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

/**
 * Formata CPF
 * @param value - Valor do documento (apenas números)
 * @returns CPF formatado (000.000.000-00)
 */
export const formatDocument = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  
  // CPF (11 dígitos)
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  if (numbers.length <= 11) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  
  // Limitar a 11 dígitos para CPF
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

/**
 * Valida se um CEP brasileiro é válido
 * @param cep - CEP (com ou sem formatação)
 * @returns true se válido, false caso contrário
 */
export const isValidCEP = (cep: string): boolean => {
  const cleanCEP = removeFormatting(cep);
  return cleanCEP.length === 8;
};

/**
 * Valida se um CPF é válido
 * @param document - Documento (com ou sem formatação)
 * @returns true se válido, false caso contrário
 */
export const isValidDocument = (document: string): boolean => {
  const cleanDocument = removeFormatting(document);
  return cleanDocument.length === 11;
};

/**
 * Normaliza texto removendo acentos e convertendo para minúsculas
 * @param text - Texto para normalizar
 * @returns Texto normalizado sem acentos
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
};