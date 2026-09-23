/**
 * Cineza - Analytics Tracker Forwarder (Phase 5 Compatibility Layer)
 * Loads and delegates to /assets/js/analytics.js
 */
(function(window) {
  'use strict';
  if (typeof window.CinezaAnalytics === 'undefined') {
    // Analytics module will load via analytics.js
  }
})(typeof window !== 'undefined' ? window : this);
