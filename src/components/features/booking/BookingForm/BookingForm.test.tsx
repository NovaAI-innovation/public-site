import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock EmailJS service BEFORE any imports that might use it
// Use vi.fn() directly in the factory to avoid hoisting issues
vi.mock('../../../../utils/emailjsService', () => ({
  sendBookingEmail: vi.fn(),
}));

// Import BookingForm and mocked function after mock is set up
import { BookingForm } from './BookingForm';
import { sendBookingEmail as mockSendBookingEmail } from '../../../../utils/emailjsService';

describe('BookingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendBookingEmail.mockReset();
    // Set up environment variables
    import.meta.env.VITE_EMAILJS_SERVICE_ID = 'test-service-id';
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID = 'test-template-id';
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY = 'test-public-key';
  });

  it('renders all form fields', () => {
    render(<BookingForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('renders name field as required', () => {
    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    expect(nameInput).toHaveAttribute('required');
    expect(nameInput).toHaveAttribute('type', 'text');
  });

  it('renders email field with email type', () => {
    render(<BookingForm />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('renders phone field with tel type', () => {
    render(<BookingForm />);

    const phoneInput = screen.getByLabelText(/phone/i);
    expect(phoneInput).toHaveAttribute('type', 'tel');
    expect(phoneInput).not.toHaveAttribute('required');
  });

  it('renders message field as required', () => {
    render(<BookingForm />);

    const messageInput = screen.getByLabelText(/message/i);
    expect(messageInput).toHaveAttribute('required');
    expect(messageInput.tagName).toBe('TEXTAREA');
  });

  it('allows user to type in name field', () => {
    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(nameInput.value).toBe('John Doe');
  });

  it('allows user to type in email field', () => {
    render(<BookingForm />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    expect(emailInput.value).toBe('john@example.com');
  });

  it('allows user to type in phone field', () => {
    render(<BookingForm />);

    const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;
    fireEvent.change(phoneInput, { target: { value: '123-456-7890' } });

    expect(phoneInput.value).toBe('123-456-7890');
  });

  it('allows user to type in message field', () => {
    render(<BookingForm />);

    const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    expect(messageInput.value).toBe('Test message');
  });

  it('shows validation error when submitting empty form', async () => {
    render(<BookingForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendBookingEmail).not.toHaveBeenCalled();
    });

    // HTML5 validation should prevent submission
    const nameInput = screen.getByLabelText(/full name/i);
    expect(nameInput).toBeInvalid();
  });

  it('validates email format', async () => {
    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeInvalid();
    });

    expect(mockSendBookingEmail).not.toHaveBeenCalled();
  });

  it('sends email via EmailJS when form is valid', async () => {
    mockSendBookingEmail.mockResolvedValue(undefined);

    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '123-456-7890' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendBookingEmail).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        message: 'Test message',
      });
    });
  });

  it('shows success message after successful submission', async () => {
    mockSendBookingEmail.mockResolvedValue(undefined);

    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/thank you!/i)).toBeInTheDocument();
      expect(screen.getByText(/successfully/i)).toBeInTheDocument();
    });
  });

  it('resets form after successful submission', async () => {
    mockSendBookingEmail.mockResolvedValue(undefined);

    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(messageInput.value).toBe('');
    });
  });

  it('shows error message when EmailJS fails', async () => {
    mockSendBookingEmail.mockRejectedValue(new Error('Failed to send booking email: EmailJS error'));

    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to send/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockSendBookingEmail.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(mockSendBookingEmail).toHaveBeenCalled();
    });
  });

  it('disables submit button during submission', async () => {
    mockSendBookingEmail.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(mockSendBookingEmail).toHaveBeenCalled();
    }, { timeout: 200 });
  });

  it('clears error message when user types', async () => {
    mockSendBookingEmail.mockRejectedValue(new Error('Failed to send booking email: EmailJS error'));

    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to send/i)).toBeInTheDocument();
    });

    // User starts typing in any field - should clear error
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    await waitFor(() => {
      expect(screen.queryByText(/failed to send/i)).not.toBeInTheDocument();
    });
  });

  it('has accessible labels for all inputs', () => {
    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const messageInput = screen.getByLabelText(/message/i);

    expect(nameInput).toHaveAttribute('aria-label');
    expect(emailInput).toHaveAttribute('aria-label');
    expect(phoneInput).toHaveAttribute('aria-label');
    expect(messageInput).toHaveAttribute('aria-label');
  });

  it('supports keyboard navigation', () => {
    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Verify all inputs are focusable and can receive focus
    nameInput.focus();
    expect(document.activeElement).toBe(nameInput);

    emailInput.focus();
    expect(document.activeElement).toBe(emailInput);

    phoneInput.focus();
    expect(document.activeElement).toBe(phoneInput);

    messageInput.focus();
    expect(document.activeElement).toBe(messageInput);

    submitButton.focus();
    expect(document.activeElement).toBe(submitButton);
  });
});
