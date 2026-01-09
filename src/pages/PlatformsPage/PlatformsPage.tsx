import React from 'react';
import { SEO } from '../../components/SEO/SEO';
import styles from './PlatformsPage.module.css';

/**
 * PlatformsPage component - displays information about platforms
 * Includes Open Graph metadata for social sharing (FR45)
 */
function PlatformsPage() {
  return (
    <div className={styles.platformsPage} data-testid="platforms-page">
      <SEO
        title="Platforms - Gallery"
        description="Information about our platforms. More details coming soon."
        url="/platforms"
        type="website"
      />
      <main className={styles.main}>
        <h1 className={styles.title}>Platforms</h1>
        <p className={styles.description}>
          Information about our platforms. More details coming soon.
        </p>
      </main>
    </div>
  );
}

export default PlatformsPage;
