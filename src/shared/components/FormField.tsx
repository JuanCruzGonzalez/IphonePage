import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactElement;
}

/**
 * Componente global reutilizable para campos de formulario.
 * Evita repetir la estructura label + input + error en cada formulario.
 *
 * Uso:
 *   <FormField id="email" label="Email" required error={errors.email}>
 *     <input id="email" type="email" value={email} onChange={...} />
 *   </FormField>
 */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required,
  error,
  children,
}) => (
  <div className="form-group" style={{ marginBottom: '16px' }}>
    <label htmlFor={id} className="form-label">
      {label}{required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && (
      <span
        className="error-message"
        style={{ color: '#dc2626', fontSize: '12px', marginTop: 4, display: 'block' }}
      >
        {error}
      </span>
    )}
  </div>
);
