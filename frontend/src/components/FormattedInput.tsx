import React from 'react';
import { Form } from 'react-bootstrap';
import { formatPhone, formatCEP } from '../utils/formatters';

interface FormattedInputProps {
  type: 'phone' | 'cep';
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  label?: string;
  className?: string;
}

const FormattedInput: React.FC<FormattedInputProps> = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  label,
  className = 'mb-3'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let formattedValue = inputValue;

    // Aplicar formatação baseada no tipo
    if (type === 'phone') {
      formattedValue = formatPhone(inputValue);
    } else if (type === 'cep') {
      formattedValue = formatCEP(inputValue);
    }

    // Chamar onChange com o valor formatado
    onChange({
      ...e,
      target: {
        ...e.target,
        value: formattedValue
      }
    });
  };

  const getMaxLength = () => {
    if (type === 'phone') return 15;
    if (type === 'cep') return 9;
    return undefined;
  };

  const getDefaultPlaceholder = () => {
    if (type === 'phone') return '(11) 99999-9999';
    if (type === 'cep') return '00000-000';
    return placeholder;
  };

  return (
    <Form.Group className={className}>
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control
        type={type === 'phone' ? 'tel' : 'text'}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={getDefaultPlaceholder()}
        maxLength={getMaxLength()}
        required={required}
      />
    </Form.Group>
  );
};

export default FormattedInput;
