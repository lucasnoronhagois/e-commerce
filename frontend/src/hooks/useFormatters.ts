import { useCallback } from 'react';
import { formatPhone, formatCEP, removeFormatting } from '../utils/formatters';

/**
 * Hook personalizado para formatação de campos de formulário
 */
export const useFormatters = () => {
  const handlePhoneChange = useCallback((value: string) => {
    return formatPhone(value);
  }, []);

  const handleCEPChange = useCallback((value: string) => {
    return formatCEP(value);
  }, []);

  const cleanPhone = useCallback((value: string) => {
    return removeFormatting(value);
  }, []);

  const cleanCEP = useCallback((value: string) => {
    return removeFormatting(value);
  }, []);

  return {
    handlePhoneChange,
    handleCEPChange,
    cleanPhone,
    cleanCEP,
  };
};
