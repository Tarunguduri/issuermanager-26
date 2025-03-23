
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ServiceError extends Error {
  code?: string;
  details?: string;
}

export const handleServiceError = (error: any, customMessage?: string): ServiceError => {
  console.error('Service error:', error);
  
  const serviceError: ServiceError = new Error(
    customMessage || error.message || 'An unexpected error occurred'
  );
  
  if (error.code) {
    serviceError.code = error.code;
  }
  
  if (error.details) {
    serviceError.details = error.details;
  }
  
  return serviceError;
};

export const showErrorToast = (error: ServiceError) => {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
};

export { supabase };
