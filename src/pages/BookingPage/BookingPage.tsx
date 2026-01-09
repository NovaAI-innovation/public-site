import React from 'react';
import { SEO } from '../../components/SEO/SEO';
import { BookingForm } from '../../components/features/booking';
import styles from './BookingPage.module.css';

/**
 * BookingPage component - booking/contact page
 * Includes booking form with EmailJS integration for submitting contact requests (FR51, FR52, FR53)
 * Includes Open Graph metadata for social sharing (FR45)
 */
function BookingPage() {
  return (
    <div className={styles.bookingPage} data-testid="booking-page">
      <SEO
        title="Book a Session - Gallery"
        description="Contact us to book a session. Fill out the form below to request a booking."
        url="/book"
        type="website"
      />
      <main className={styles.main}>
        <h1 className={styles.title}>Book a Session</h1>
        <p className={styles.description}>
          Fill out the form below to request a booking. All information will be kept confidential.
        </p>
        <BookingForm />
      </main>
    </div>
  );
}

export default BookingPage;
