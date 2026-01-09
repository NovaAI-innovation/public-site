import React from 'react';
import { SEO } from '../../components/SEO/SEO';
import styles from './AboutPage.module.css';

/**
 * AboutPage component - displays information about the organization
 * Includes Open Graph metadata for social sharing (FR45)
 */
function AboutPage() {
  return (
    <div className={styles.aboutPage} data-testid="about-page">
      <SEO
        title="About Us - Gallery"
        description="Learn more about our organization and mission. More information coming soon."
        url="/about"
        type="website"
      />
      <main className={styles.main}>
        <h1 className={styles.title}>About Us</h1>
        <p className={styles.description}>
          Learn more about our organization and mission. More information coming soon.
        </p>
      </main>
    </div>
  );
}

export default AboutPage;
