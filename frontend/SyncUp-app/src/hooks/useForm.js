/**
 * USEFORM.JS - Custom hook para formularios
 */

import { useState } from 'react';

export const useForm = (initialValues = {}, onSubmit, validationRules = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    let newValue = value;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      newValue = files[0];
    }

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    if (validationRules && validationRules[name]) {
      const result = validationRules[name](values[name]);
      if (!result.isValid) {
        setErrors(prev => ({
          ...prev,
          [name]: result.error
        }));
      }
    }
  };

  const validateForm = () => {
    if (!validationRules) return true;

    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const validator = validationRules[fieldName];
      const result = validator(values[fieldName]);

      if (!result.isValid) {
        newErrors[fieldName] = result.error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error en submit:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const setValue = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setError = (name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const setFormValues = (newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValue,
    setError,
    setFormValues,
  };
};

export default useForm;