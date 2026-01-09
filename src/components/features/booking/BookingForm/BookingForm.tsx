import React, { useState, FormEvent, ChangeEvent } from 'react';
import { sendBookingEmail } from '../../../../utils/emailjsService';
import type { BookingFormData } from '../../../../types/booking';
import styles from './BookingForm.module.css';

interface BookingFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * BookingForm component - contact form for booking requests
 * Integrates with EmailJS to send booking requests (FR51, FR52, FR53)
 * Validates required fields and email format (AC: #1)
 * Accessible with proper labels and input types (AC: #1, NFR-A7, NFR-U11)
 * EmailJS is lazy loaded for performance (NFR-P35)
 */
export function BookingForm({ onSuccess, onError }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    
    // HTML5 validation check
    if (!form.checkValidity()) {
      // Trigger HTML5 validation UI
      form.reportValidity();
      return;
    }

    // Clear previous messages
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Send email via EmailJS (lazy loaded, NFR-P35)
      await sendBookingEmail(formData);

      // Success: show message and reset form
      setSuccessMessage('Thank you! Your booking request has been sent successfully. We will respond within 24 hours.');
      resetForm();

      // Call optional success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error: show user-friendly error message
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'Failed to send booking request. Please try again later.';
      setErrorMessage(errorMsg);

      // Call optional error callback
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Full Name <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          aria-label="Full Name"
          aria-required="true"
          className={styles.input}
          placeholder="Your full name"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email Address <span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-label="Email Address"
          aria-required="true"
          className={styles.input}
          placeholder="your.email@example.com"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone" className={styles.label}>
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          aria-label="Phone Number"
          className={styles.input}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>
          Message <span className={styles.required}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          aria-label="Message"
          aria-required="true"
          className={styles.textarea}
          placeholder="Your message here..."
          rows={5}
        />
      </div>

      {errorMessage && (
        <div className={styles.message} role="alert" aria-live="assertive">
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
        </div>
      )}

      {successMessage && (
        <div className={styles.message} role="alert" aria-live="polite">
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        </div>
      )}

      <div className={styles.formActions}>
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner} aria-hidden="true"></span>
              <span>Sending...</span>
            </>
          ) : (
            'Submit Booking Request'
          )}
        </button>
      </div>
    </form>
  );
}
