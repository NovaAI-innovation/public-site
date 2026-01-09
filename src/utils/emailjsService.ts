import type { BookingFormData } from '../types/booking';

/**
 * EmailJS service utility
 * Lazy loads EmailJS SDK for performance (NFR-P35)
 * Sends booking form data via EmailJS
 */

interface EmailJSParams {
  from_name: string;
  from_email: string;
  phone: string;
  message: string;
}

/**
 * Sends booking form data via EmailJS
 * Lazy loads EmailJS SDK on first call (NFR-P35)
 * 
 * @param formData - Booking form data to send
 * @throws Error if EmailJS configuration is missing or send fails
 */
export async function sendBookingEmail(formData: BookingFormData): Promise<void> {
  // Get EmailJS configuration from environment variables
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // Validate configuration
  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS configuration is missing. Please check environment variables.');
  }

  // Lazy load EmailJS SDK (NFR-P35: defer until needed)
  const emailjs = await import('@emailjs/browser');

  // Prepare template parameters
  const templateParams: EmailJSParams = {
    from_name: formData.name,
    from_email: formData.email,
    phone: formData.phone || '', // Phone is optional
    message: formData.message,
  };

  try {
    // Send email via EmailJS
    await emailjs.default.send(serviceId, templateId, templateParams, publicKey);
  } catch (error) {
    // Re-throw with context
    if (error instanceof Error) {
      throw new Error(`Failed to send booking email: ${error.message}`);
    }
    throw new Error('Failed to send booking email: Unknown error');
  }
}
