import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { GalleryImage } from '../../types/gallery';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

/**
 * SEO component - manages Open Graph and Twitter Card metadata for social sharing
 * Supports dynamic metadata for pages and gallery images (FR45)
 */
export function SEO({
  title = 'Gallery',
  description = 'Explore our collection of beautiful images',
  image,
  url,
  type = 'website',
  siteName = 'Gallery',
}: SEOProps) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image
    ? image.startsWith('http')
      ? image
      : `${siteUrl}${image}`
    : undefined;

  // Default image if none provided
  const ogImage = fullImageUrl || `${siteUrl}/og-default.jpg`;

  return (
    <Helmet>
      {/* Primary meta tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {siteName && <meta property="og:site_name" content={siteName} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

/**
 * SEO component for gallery images with image-specific metadata
 * Uses image data to generate appropriate Open Graph tags (FR45)
 */
export function GalleryImageSEO({ image }: { image: GalleryImage }) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const imageUrl = `${siteUrl}/gallery/${image.id}`;
  
  // Generate title from caption or fallback
  const title = image.caption || `Gallery Image #${image.id}`;
  
  // Generate description
  const description = image.caption
    ? `View ${image.caption} in our gallery`
    : `View image #${image.id} in our gallery`;

  // Use Cloudinary image URL for og:image
  const ogImage = image.cloudinary_url || '';

  return (
    <SEO
      title={title}
      description={description}
      image={ogImage}
      url={imageUrl}
      type="article"
      siteName="Gallery"
    />
  );
}
