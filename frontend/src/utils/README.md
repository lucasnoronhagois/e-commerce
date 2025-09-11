# Formatação de Campos

Este diretório contém utilitários para formatação automática de campos de formulário.

## Funcionalidades

### Formatação de Telefone
- **Formato**: `(11) 99999-9999` ou `(11) 9999-9999`
- **Suporte**: Telefones fixos (10 dígitos) e celulares (11 dígitos)
- **Validação**: Apenas números são aceitos

### Formatação de CEP
- **Formato**: `00000-000`
- **Validação**: Exatamente 8 dígitos

## Como Usar

### 1. Componente FormattedInput (Recomendado)

```tsx
import FormattedInput from '../components/FormattedInput';

// Telefone
<FormattedInput
  type="phone"
  name="phone"
  value={formData.phone}
  onChange={handleChange}
  label="Telefone"
  required
/>

// CEP
<FormattedInput
  type="cep"
  name="zipCode"
  value={formData.zipCode}
  onChange={handleChange}
  label="CEP"
  required
/>
```

### 2. Funções Utilitárias

```tsx
import { formatPhone, formatCEP, removeFormatting } from '../utils/formatters';

// Formatar valores
const formattedPhone = formatPhone('11999999999'); // (11) 99999-9999
const formattedCEP = formatCEP('01234567'); // 01234-567

// Remover formatação (para envio ao backend)
const cleanPhone = removeFormatting('(11) 99999-9999'); // 11999999999
const cleanCEP = removeFormatting('01234-567'); // 01234567
```

### 3. Hook useFormatters

```tsx
import { useFormatters } from '../hooks/useFormatters';

const { handlePhoneChange, handleCEPChange, cleanPhone, cleanCEP } = useFormatters();

// Usar nas funções de mudança
const handleChange = (e) => {
  const { name, value } = e.target;
  let formattedValue = value;
  
  if (name === 'phone') {
    formattedValue = handlePhoneChange(value);
  } else if (name === 'zipCode') {
    formattedValue = handleCEPChange(value);
  }
  
  setFormData({ ...formData, [name]: formattedValue });
};
```

## Validação

```tsx
import { isValidPhone, isValidCEP } from '../utils/formatters';

// Validar antes de enviar
if (!isValidPhone(formData.phone)) {
  setError('Telefone inválido');
  return;
}

if (!isValidCEP(formData.zipCode)) {
  setError('CEP inválido');
  return;
}
```

## Exemplo Completo

```tsx
import React, { useState } from 'react';
import { FormattedInput } from '../components/FormattedInput';
import { removeFormatting, isValidPhone, isValidCEP } from '../utils/formatters';

const MyForm = () => {
  const [formData, setFormData] = useState({
    phone: '',
    zipCode: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar
    if (!isValidPhone(formData.phone)) {
      alert('Telefone inválido');
      return;
    }
    
    if (!isValidCEP(formData.zipCode)) {
      alert('CEP inválido');
      return;
    }
    
    // Enviar dados limpos para o backend
    const data = {
      phone: removeFormatting(formData.phone),
      zipCode: removeFormatting(formData.zipCode)
    };
    
    // ... enviar para API
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormattedInput
        type="phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        label="Telefone"
        required
      />
      
      <FormattedInput
        type="cep"
        name="zipCode"
        value={formData.zipCode}
        onChange={handleChange}
        label="CEP"
        required
      />
      
      <button type="submit">Enviar</button>
    </form>
  );
};
```
