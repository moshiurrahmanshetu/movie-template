/**
 * Cineza - Centralized Analytics Configuration (Phase 5)
 * Pure Vanilla JavaScript Configuration
 * 
 * ============================================================================
 * REAL VISITOR ANALYTICS SETUP GUIDE:
 * ============================================================================
 * 1. REAL ANALYTICS ONLY:
 *    This static frontend does NOT use simulated counters or fake visitor
 *    numbers. Real metrics must come from a connected provider such as
 *    Google Analytics 4 (GA4), Plausible, Umami, or Cloudflare Web Analytics.
 * 
 * 2. HOW TO ACTIVATE:
 *    - Step 1: Set `analyticsEnabled: true` below.
 *    - Step 2: Replace `measurementId: "YOUR_ANALYTICS_ID"` with your actual ID
 *              (e.g., 'G-XXXXXXXXXX' for Google Analytics 4).
 *    - Step 3: (Optional) Set `consentRequired: true` if you require an opt-in
 *              cookie/consent banner for GDPR/CCPA compliance.
 * 
 * 3. GRACEFUL ISOLATION:
 *    When `analyticsEnabled: false`, no external scripts are loaded, no data
 *    is collected, and site performance remains completely unaffected.
 * ============================================================================
 */

(function(window) {
  'use strict';

  window.CinezaAnalyticsConfig = {
    // Master switch: Set to true once you have supplied a real measurement ID
    analyticsEnabled: false,

    // Analytics Provider type: 'ga4' | 'plausible' | 'umami' | 'cloudflare' | 'custom'
    provider: 'ga4',

    // Measurement ID / Tracking ID placeholder (Do NOT use fake IDs)
    // Examples: 'G-XXXXXXXXXX' (GA4), 'yourdomain.com' (Plausible), 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' (Umami)
    measurementId: 'YOUR_ANALYTICS_ID',

    // Optional self-hosted API endpoint (Used for Umami, Plausible self-hosted, or custom backend)
    apiEndpoint: '',

    // Debug Mode: When true, prints tracking events to the browser console for inspection
    debugMode: false,

    // Cookie & Consent banner requirement:
    // When true (and analyticsEnabled is true), analytics tracking is paused until the user clicks 'Accept'
    consentRequired: false,

    // Environment descriptor: 'development' | 'staging' | 'production'
    environment: 'production',

    // Anonymize IP addresses (GA4 / Custom beacon)
    anonymizeIp: true
  };

})(typeof window !== 'undefined' ? window : this);
