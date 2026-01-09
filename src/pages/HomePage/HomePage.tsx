import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO/SEO';
import styles from './HomePage.module.css';

/**
 * HomePage component - landing page for the public site
 * Provides navigation to main sections (FR35)
 * Includes Open Graph metadata for social sharing (FR45)
 */
function HomePage() {
  return (
    <div className={styles.homePage} data-testid="home-page">
      <SEO
        title="Welcome to the Gallery"
        description="Explore our collection of images and discover our services."
        url="/"
        type="website"
      />
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to the Gallery</h1>
        <p className={styles.description}>
          Explore our collection of images and discover our services.
        </p>
        
        <nav className={styles.navigation}>
          <Link to="/gallery" className={styles.link}>
            View Gallery
          </Link>
          <Link to="/services" className={styles.link}>
            Our Services
          </Link>
          <Link to="/platforms" className={styles.link}>
            Platforms
          </Link>
          <Link to="/book" className={styles.link}>
            Book a Session
          </Link>
          <Link to="/etiquette" className={styles.link}>
            Etiquette
          </Link>
          <Link to="/about" className={styles.link}>
            About Us
          </Link>
        </nav>
      </main>
    </div>
  );
}

export default HomePage;
