export const getErrorMessage = (error, defaultMessage = 'An unexpected error occurred') => {
  if (!error) return defaultMessage;
  
  if (typeof error === 'string') return error;

  if (error.response?.data) {
    const { message, errors } = error.response.data;
    if (errors && Array.isArray(errors) && errors.length > 0) {
      return errors.join(', ');
    }
    if (message) return message;
  }

  if (error.message) return error.message;

  return defaultMessage;
};
