/**
 * Cineza - Real Visitor Analytics Tracker (Phase 3)
 * Pure Vanilla JavaScript Analytics Integration Module
 * 
 * ============================================================================
 * IMPORTANT ARCHITECTURAL DESIGN & COMPLIANCE:
 * ============================================================================
 * 1. ZERO FAKE COUNTERS:
 *    - Does NOT use localStorage or sessionStorage to fake visitor numbers.
 *    - Does NOT generate random numbers or fake incrementing loops.
 *    - Does NOT show simulated counters in the UI.
 * 
 * 2. REAL ANALYTICS READY:
 *    - Designed to easily connect with real analytics providers:
 *      • Google Analytics 4 (GA4)
 *      • Plausible Analytics
 *      • Umami Analytics
 *      • Cloudflare Web Analytics
 *      • Custom Backend Analytics API
 * 
 * 3. GRACEFUL ISOLATION:
 *    - The website remains 100% operational if analytics is not yet configured.
 * 
 * 4. DASHBOARD METRICS SCHEMA PREPARATION:
 *    - Prepares data structures for future admin/visitor dashboards:
 *      Total visitors, Today visitors, Yesterday visitors, Active visitors,
 *      Page views, Popular pages, Traffic sources, Device types, Countries.
 * ============================================================================
 */

(function(window) {
  'use strict';

  // Default Analytics Configuration
  const defaultConfig = {
    // Supported providers: 'google_analytics', 'plausible', 'umami', 'custom_api', 'none'
    provider: 'none',
    siteId: '',                // e.g. 'G-XXXXXXXXXX' or 'Cineza .example.com'
    endpoint: '',              // e.g. 'https://analytics.example.com/api/event'
    debug: false,
    anonymizeIp: true
  };

  const CinezaAnalytics = {
    config: Object.assign({}, defaultConfig, window.CinezaAnalyticsConfig || {}),
    isInitialized: false,

    /**
     * Initialize analytics provider
     */
    init: function(customConfig) {
      if (customConfig) {
        this.config = Object.assign({}, this.config, customConfig);
      }

      if (this.config.debug) {
        console.info('[Cineza Analytics] Initialized with provider:', this.config.provider);
      }

      this.isInitialized = true;
      this.trackPageView();
      this.attachActionListeners();
    },

    /**
     * Check if a real analytics provider is actively configured
     */
    isProviderConfigured: function() {
      return this.config.provider !== 'none' && Boolean(this.config.siteId || this.config.endpoint);
    },

    /**
     * Track a real page view
     */
    trackPageView: function(pageTitle, path) {
      const urlPath = path || window.location.pathname;
      const title = pageTitle || document.title;
      const referrer = document.referrer || '';

      const pageData = {
        title: title,
        path: urlPath,
        url: window.location.href,
        referrer: referrer,
        timestamp: new Date().toISOString(),
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        deviceType: this.detectDeviceType()
      };

      if (this.config.debug) {
        console.debug('[Cineza Analytics] PageView Captured:', pageData);
      }

      // Forward to configured provider if active
      if (this.config.provider === 'google_analytics' && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_title: title,
          page_location: window.location.href,
          page_path: urlPath
        });
      } else if (this.config.provider === 'plausible' && typeof window.plausible === 'function') {
        window.plausible('pageview', { u: window.location.href });
      } else if (this.config.provider === 'custom_api' && this.config.endpoint) {
        this.sendCustomBeacon('/pageview', pageData);
      }
    },

    /**
     * Track user actions (Clicks on Watch, Download, Search queries)
     */
    trackEvent: function(category, action, label, value) {
      const eventData = {
        category: category || 'General',
        action: action || 'Click',
        label: label || '',
        value: value || null,
        timestamp: new Date().toISOString()
      };

      if (this.config.debug) {
        console.debug('[Cineza Analytics] Event Captured:', eventData);
      }

      if (this.config.provider === 'google_analytics' && typeof window.gtag === 'function') {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value
        });
      } else if (this.config.provider === 'plausible' && typeof window.plausible === 'function') {
        window.plausible(action, { props: { category: category, label: label } });
      } else if (this.config.provider === 'custom_api' && this.config.endpoint) {
        this.sendCustomBeacon('/event', eventData);
      }
    },

    /**
     * Dedicated Movie Interaction Tracking
     */
    trackMovieAction: function(actionType, movieSlug, movieTitle) {
      this.trackEvent('Movie_Interaction', actionType, `${movieTitle || movieSlug} (${movieSlug})`);
    },

    /**
     * Search Query Tracking
     */
    trackSearch: function(query, resultsCount) {
      if (!query) return;
      this.trackEvent('Search', 'search_query', query, resultsCount);
    },

    /**
     * Attach automated tracking to outbound movie links without blocking user navigation
     */
    attachActionListeners: function() {
      document.addEventListener('click', (e) => {
        const watchBtn = e.target.closest('.btn-watch');
        if (watchBtn) {
          const card = watchBtn.closest('.movie-card');
          const slug = card ? card.getAttribute('data-slug') : (window.location.pathname.split('/')[2] || 'unknown');
          this.trackMovieAction('watch_now_click', slug, watchBtn.getAttribute('aria-label') || slug);
          return;
        }

        const downloadBtn = e.target.closest('.btn-download, .cs-download-card .btn');
        if (downloadBtn) {
          const card = downloadBtn.closest('.movie-card') || downloadBtn.closest('.cs-download-card');
          const slug = card ? (card.getAttribute('data-slug') || 'current-movie') : 'current-movie';
          this.trackMovieAction('download_click', slug, downloadBtn.getAttribute('aria-label') || slug);
          return;
        }
      });
    },

    /**
     * Device type detector (Mobile, Tablet, Desktop)
     */
    detectDeviceType: function() {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    },

    /**
     * Custom endpoint beacon sender using Navigator.sendBeacon or fetch
     */
    sendCustomBeacon: function(subPath, payload) {
      if (!this.config.endpoint) return;
      const targetUrl = this.config.endpoint.replace(/\/+$/, '') + subPath;
      const dataStr = JSON.stringify(payload);

      if (navigator.sendBeacon) {
        navigator.sendBeacon(targetUrl, dataStr);
      } else {
        fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: dataStr,
          keepalive: true
        }).catch(() => {});
      }
    },

    /**
     * Dashboard Data Schema Definition (For Phase 4 Admin / Visitor Dashboard Integration)
     * Strictly describes data structure. Does NOT fake values.
     */
    getDashboardMetricsSchema: function() {
      return {
        metricsSupported: [
          'totalVisitors',
          'todayVisitors',
          'yesterdayVisitors',
          'currentActiveVisitors',
          'pageViews',
          'popularPages',
          'trafficSources',
          'deviceTypes',
          'countries'
        ],
        provider: this.config.provider,
        status: this.isProviderConfigured() ? 'ready' : 'awaiting_credentials'
      };
    },

    /**
     * Fetch real analytics metrics from provider backend
     * When unconfigured, resolves to null with no fake data.
     */
    fetchRealMetrics: async function() {
      if (!this.isProviderConfigured() || !this.config.endpoint) {
        if (this.config.debug) {
          console.info('[Cineza Analytics] Real metrics requested, but no backend endpoint configured.');
        }
        return null;
      }

      try {
        const response = await fetch(`${this.config.endpoint}/metrics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.siteId}`
          }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        if (this.config.debug) {
          console.error('[Cineza Analytics] Error fetching real metrics:', err);
        }
        return null;
      }
    }
  };

  // Expose globally
  window.CinezaAnalytics = CinezaAnalytics;

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CinezaAnalytics.init());
  } else {
    CinezaAnalytics.init();
  }

})(window);
