import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFormatters } from '../../hooks/useFormatters';

describe('useFormatters', () => {
  it('should format currency correctly', () => {
    const { result } = renderHook(() => useFormatters());

    expect(result.current.formatCurrency(100)).toBe('R$ 100,00');
    expect(result.current.formatCurrency(1234.56)).toBe('R$ 1.234,56');
    expect(result.current.formatCurrency(0)).toBe('R$ 0,00');
    expect(result.current.formatCurrency(999999.99)).toBe('R$ 999.999,99');
  });

  it('should format CPF correctly', () => {
    const { result } = renderHook(() => useFormatters());

    expect(result.current.formatCPF('12345678901')).toBe('123.456.789-01');
    expect(result.current.formatCPF('1234567890')).toBe('123.456.789-0');
    expect(result.current.formatCPF('123456789')).toBe('123.456.789');
    expect(result.current.formatCPF('12345678')).toBe('123.456.78');
    expect(result.current.formatCPF('1234567')).toBe('123.456.7');
    expect(result.current.formatCPF('123456')).toBe('123.456');
    expect(result.current.formatCPF('12345')).toBe('123.45');
    expect(result.current.formatCPF('1234')).toBe('123.4');
    expect(result.current.formatCPF('123')).toBe('123');
    expect(result.current.formatCPF('12')).toBe('12');
    expect(result.current.formatCPF('1')).toBe('1');
    expect(result.current.formatCPF('')).toBe('');
  });

  it('should format CEP correctly', () => {
    const { result } = renderHook(() => useFormatters());

    expect(result.current.formatCEP('12345678')).toBe('12345-678');
    expect(result.current.formatCEP('1234567')).toBe('12345-67');
    expect(result.current.formatCEP('123456')).toBe('12345-6');
    expect(result.current.formatCEP('12345')).toBe('12345');
    expect(result.current.formatCEP('1234')).toBe('1234');
    expect(result.current.formatCEP('123')).toBe('123');
    expect(result.current.formatCEP('12')).toBe('12');
    expect(result.current.formatCEP('1')).toBe('1');
    expect(result.current.formatCEP('')).toBe('');
  });

  it('should format phone correctly', () => {
    const { result } = renderHook(() => useFormatters());

    expect(result.current.formatPhone('11999999999')).toBe('(11) 99999-9999');
    expect(result.current.formatPhone('1199999999')).toBe('(11) 9999-9999');
    expect(result.current.formatPhone('119999999')).toBe('(11) 9999-999');
    expect(result.current.formatPhone('11999999')).toBe('(11) 9999-99');
    expect(result.current.formatPhone('1199999')).toBe('(11) 9999-9');
    expect(result.current.formatPhone('119999')).toBe('(11) 9999');
    expect(result.current.formatPhone('11999')).toBe('(11) 999');
    expect(result.current.formatPhone('1199')).toBe('(11) 99');
    expect(result.current.formatPhone('119')).toBe('(11) 9');
    expect(result.current.formatPhone('11')).toBe('(11');
    expect(result.current.formatPhone('1')).toBe('(1');
    expect(result.current.formatPhone('')).toBe('');
  });

  it('should validate CPF correctly', () => {
    const { result } = renderHook(() => useFormatters());

    // CPFs válidos
    expect(result.current.isValidCPF('11144477735')).toBe(true);
    expect(result.current.isValidCPF('12345678909')).toBe(true);
    
    // CPFs inválidos
    expect(result.current.isValidCPF('11111111111')).toBe(false);
    expect(result.current.isValidCPF('00000000000')).toBe(false);
    expect(result.current.isValidCPF('12345678901')).toBe(false);
    expect(result.current.isValidCPF('')).toBe(false);
    expect(result.current.isValidCPF('123')).toBe(false);
  });

  it('should validate CEP correctly', () => {
    const { result } = renderHook(() => useFormatters());

    // CEPs válidos
    expect(result.current.isValidCEP('01234-567')).toBe(true);
    expect(result.current.isValidCEP('12345678')).toBe(true);
    
    // CEPs inválidos
    expect(result.current.isValidCEP('1234-567')).toBe(false);
    expect(result.current.isValidCEP('1234567')).toBe(false);
    expect(result.current.isValidCEP('')).toBe(false);
    expect(result.current.isValidCEP('abc')).toBe(false);
  });

  it('should validate phone correctly', () => {
    const { result } = renderHook(() => useFormatters());

    // Telefones válidos
    expect(result.current.isValidPhone('11999999999')).toBe(true);
    expect(result.current.isValidPhone('1199999999')).toBe(true);
    
    // Telefones inválidos
    expect(result.current.isValidPhone('119999999')).toBe(false);
    expect(result.current.isValidPhone('11999999')).toBe(false);
    expect(result.current.isValidPhone('')).toBe(false);
    expect(result.current.isValidPhone('abc')).toBe(false);
  });

  it('should remove formatting from strings', () => {
    const { result } = renderHook(() => useFormatters());

    expect(result.current.removeFormatting('123.456.789-01')).toBe('12345678901');
    expect(result.current.removeFormatting('12345-678')).toBe('12345678');
    expect(result.current.removeFormatting('(11) 99999-9999')).toBe('11999999999');
    expect(result.current.removeFormatting('R$ 1.234,56')).toBe('1234,56');
    expect(result.current.removeFormatting('')).toBe('');
  });

  it('should handle edge cases in formatting', () => {
    const { result } = renderHook(() => useFormatters());

    // Currency with very large numbers
    expect(result.current.formatCurrency(999999999.99)).toBe('R$ 999.999.999,99');
    
    // CPF with special characters
    expect(result.current.formatCPF('123.456.789-01')).toBe('123.456.789-01');
    
    // CEP with special characters
    expect(result.current.formatCEP('12345-678')).toBe('12345-678');
    
    // Phone with special characters
    expect(result.current.formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999');
  });

  it('should handle null and undefined values gracefully', () => {
    const { result } = renderHook(() => useFormatters());

    expect(result.current.formatCurrency(null as any)).toBe('R$ 0,00');
    expect(result.current.formatCurrency(undefined as any)).toBe('R$ 0,00');
    expect(result.current.formatCPF(null as any)).toBe('');
    expect(result.current.formatCPF(undefined as any)).toBe('');
    expect(result.current.formatCEP(null as any)).toBe('');
    expect(result.current.formatCEP(undefined as any)).toBe('');
    expect(result.current.formatPhone(null as any)).toBe('');
    expect(result.current.formatPhone(undefined as any)).toBe('');
  });
});
