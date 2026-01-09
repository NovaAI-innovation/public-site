import React from 'react';
import { SEO } from '../../components/SEO/SEO';
import styles from './ServicesPage.module.css';

/**
 * ServicesPage component - displays information about services offered
 * Includes Open Graph metadata for social sharing (FR45)
 */
function ServicesPage() {
  return (
    <div className={styles.servicesPage} data-testid="services-page">
      <SEO
        title="Our Services - Gallery"
        description="We offer a variety of professional services. More information coming soon."
        url="/services"
        type="website"
      />
      <main className={styles.main}>
        <h1 className={styles.title}>Our Services</h1>
        <p className={styles.description}>
          We offer a variety of professional services. More information coming soon.
        </p>
      </main>
    </div>
  );
}

export default ServicesPage;
