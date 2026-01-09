import React from 'react';
import { SEO } from '../../components/SEO/SEO';
import styles from './EtiquettePage.module.css';

/**
 * EtiquettePage component - displays etiquette information
 * Includes Open Graph metadata for social sharing (FR45)
 */
function EtiquettePage() {
  return (
    <div className={styles.etiquettePage} data-testid="etiquette-page">
      <SEO
        title="Etiquette - Gallery"
        description="Guidelines and etiquette information. More details coming soon."
        url="/etiquette"
        type="website"
      />
      <main className={styles.main}>
        <h1 className={styles.title}>Etiquette</h1>
        <p className={styles.description}>
          Guidelines and etiquette information. More details coming soon.
        </p>
      </main>
    </div>
  );
}

export default EtiquettePage;
