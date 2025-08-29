// Shared date utility functions

export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  
  return today.toDateString() === date.toDateString();
};

export const daysSince = (dateString: string): number => {
  const today = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(today.getTime() - date.getTime());
  
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
