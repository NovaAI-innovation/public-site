import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO/SEO';
import styles from './NotFoundPage.module.css';

/**
 * NotFoundPage component - displays a user-friendly 404 error page
 * Shows helpful navigation options back to gallery and home
 * Includes proper accessibility features (AC: #1)
 */
function NotFoundPage() {
  return (
    <div className={styles.notFoundPage} data-testid="not-found-page">
      <SEO
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist."
        url="/404"
        type="website"
      />
      <main className={styles.main}>
        <h1 className={styles.heading}>404</h1>
        <p className={styles.message}>Page Not Found</p>
        <p className={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <nav className={styles.navigation} aria-label="Navigation options">
          <Link to="/gallery" className={styles.link}>
            Back to Gallery
          </Link>
          <Link to="/" className={styles.link}>
            Go Home
          </Link>
        </nav>
      </main>
    </div>
  );
}

export default NotFoundPage;
