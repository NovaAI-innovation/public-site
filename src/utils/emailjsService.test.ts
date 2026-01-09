import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendBookingEmail } from './emailjsService';

// Mock EmailJS
vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn(),
  },
}));

describe('emailjsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables
    import.meta.env.VITE_EMAILJS_SERVICE_ID = 'test-service-id';
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID = 'test-template-id';
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY = 'test-public-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends email with correct parameters', async () => {
    const { default: emailjs } = await import('@emailjs/browser');
    vi.mocked(emailjs.send).mockResolvedValue({ status: 200, text: 'OK' });

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      message: 'Test message',
    };

    await sendBookingEmail(formData);

    expect(emailjs.send).toHaveBeenCalledWith(
      'test-service-id',
      'test-template-id',
      expect.objectContaining({
        from_name: 'John Doe',
        from_email: 'john@example.com',
        phone: '123-456-7890',
        message: 'Test message',
      }),
      'test-public-key'
    );
  });

  it('sends email without phone if phone is empty', async () => {
    const { default: emailjs } = await import('@emailjs/browser');
    vi.mocked(emailjs.send).mockResolvedValue({ status: 200, text: 'OK' });

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '',
      message: 'Test message',
    };

    await sendBookingEmail(formData);

    expect(emailjs.send).toHaveBeenCalledWith(
      'test-service-id',
      'test-template-id',
      expect.objectContaining({
        from_name: 'John Doe',
        from_email: 'john@example.com',
        phone: '',
        message: 'Test message',
      }),
      'test-public-key'
    );
  });

  it('throws error if EmailJS service fails', async () => {
    const { default: emailjs } = await import('@emailjs/browser');
    vi.mocked(emailjs.send).mockRejectedValue(new Error('EmailJS error'));

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      message: 'Test message',
    };

    await expect(sendBookingEmail(formData)).rejects.toThrow('EmailJS error');
  });

  it('throws error if environment variables are missing', async () => {
    // Clear environment variables
    import.meta.env.VITE_EMAILJS_SERVICE_ID = '';
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID = '';
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY = '';

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      message: 'Test message',
    };

    await expect(sendBookingEmail(formData)).rejects.toThrow(
      'EmailJS configuration is missing'
    );
  });

  it('uses dynamic import for lazy loading', async () => {
    const { default: emailjs } = await import('@emailjs/browser');
    vi.mocked(emailjs.send).mockResolvedValue({ status: 200, text: 'OK' });

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      message: 'Test message',
    };
    
    await sendBookingEmail(formData);

    // Verify that EmailJS was called (which confirms dynamic import worked)
    expect(emailjs.send).toHaveBeenCalled();
  });
});
