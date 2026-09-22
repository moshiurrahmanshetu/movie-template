/**
 * CineSphere - Modular Visitor Analytics Loader (Phase 5)
 * Pure Vanilla JavaScript Module
 * 
 * ============================================================================
 * ARCHITECTURAL RULES & STANDARDS:
 * ============================================================================
 * 1. REAL ANALYTICS ONLY:
 *    - Absolutely NO random or simulated visitor numbers.
 *    - Absolutely NO fake localStorage/sessionStorage visitor counters.
 *    - All public analytics data must come from real provider telemetry.
 * 
 * 2. CONDITIONAL EXECUTION:
 *    - If `analyticsEnabled` is false or measurementId is unchanged from placeholder,
 *      no network requests or provider scripts are executed.
 *    - The website functions with 100% speed and reliability.
 * 
 * 3. TRACKED CORE EVENTS (When Enabled):
 *    - page_view: Current URL path and title
 *    - movie_view: Movie details (slug, title, category, quality, language)
 *    - search: User search query (`search_term`)
 *    - category_view: Category archive navigation
 *    - watch_click: Watch Now action (slug, title, server)
 *    - download_click: Download action (slug, title, quality)
 *    - external_link_click: Outbound navigation
 * ============================================================================
 */

(function(window, document) {
  'use strict';

  const CineSphereAnalytics = {
    config: null,
    isInitialized: false,
    consentState: 'pending', // 'granted' | 'denied' | 'pending'

    /**
     * Read configuration and initialize if active
     */
    init: function() {
      this.config = Object.assign({
        analyticsEnabled: false,
        provider: 'ga4',
        measurementId: 'YOUR_ANALYTICS_ID',
        apiEndpoint: '',
        debugMode: false,
        consentRequired: false,
        environment: 'production',
        anonymizeIp: true
      }, window.CineSphereAnalyticsConfig || {});

      if (this.config.debugMode) {
        console.info('[CineSphere Analytics] Config loaded:', {
          enabled: this.config.analyticsEnabled,
          provider: this.config.provider,
          consentRequired: this.config.consentRequired
        });
      }

      // Check if analytics is disabled or placeholder ID remains
      if (!this.config.analyticsEnabled || 
          !this.config.measurementId || 
          this.config.measurementId === 'YOUR_ANALYTICS_ID') {
        if (this.config.debugMode) {
          console.info('[CineSphere Analytics] Analytics disabled or awaiting real measurementId. No tracking active.');
        }
        return;
      }

      // Handle Cookie / Consent Architecture if enabled
      if (this.config.consentRequired) {
        const savedConsent = this.getStoredConsent();
        if (savedConsent === 'granted') {
          this.consentState = 'granted';
          this.bootstrapProvider();
        } else if (savedConsent === 'denied') {
          this.consentState = 'denied';
          if (this.config.debugMode) {
            console.info('[CineSphere Analytics] User previously declined analytics consent.');
          }
          return;
        } else {
          this.renderConsentBanner();
          return; // Wait for user decision
        }
      } else {
        this.consentState = 'granted';
        this.bootstrapProvider();
      }
    },

    /**
     * Storage helper for consent (Stores only the user's preference boolean, ZERO fake visitor stats)
     */
    getStoredConsent: function() {
      try {
        return localStorage.getItem('cinesphere_analytics_consent');
      } catch (e) {
        return null;
      }
    },

    setStoredConsent: function(value) {
      try {
        localStorage.setItem('cinesphere_analytics_consent', value);
      } catch (e) {}
    },

    /**
     * Render lightweight non-intrusive consent banner (Only when analytics is enabled)
     */
    renderConsentBanner: function() {
      if (document.getElementById('csConsentBanner')) return;

      const banner = document.createElement('div');
      banner.id = 'csConsentBanner';
      banner.className = 'cs-consent-banner';
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-label', 'Analytics Privacy Preferences');
      banner.innerHTML = `
        <div class="cs-container d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div class="cs-consent-text">
            <i class="bi bi-shield-check text-accent me-2"></i>
            <span><strong>Privacy & Analytics:</strong> CineSphere uses lightweight anonymous telemetry to measure movie popularity and improve streaming performance. No personal tracking or cross-site profiling.</span>
          </div>
          <div class="cs-consent-actions d-flex align-items-center gap-2 flex-shrink-0">
            <button type="button" class="btn btn-sm btn-outline-secondary text-white" id="csConsentDeclineBtn">Decline</button>
            <button type="button" class="btn btn-sm btn-watch" id="csConsentAcceptBtn">Accept</button>
          </div>
        </div>
      `;

      document.body.appendChild(banner);

      document.getElementById('csConsentAcceptBtn')?.addEventListener('click', () => {
        this.setStoredConsent('granted');
        this.consentState = 'granted';
        banner.remove();
        this.bootstrapProvider();
      });

      document.getElementById('csConsentDeclineBtn')?.addEventListener('click', () => {
        this.setStoredConsent('denied');
        this.consentState = 'denied';
        banner.remove();
        if (this.config.debugMode) {
          console.info('[CineSphere Analytics] Analytics consent declined by user.');
        }
      });
    },

    /**
     * Bootstrap the real analytics provider dynamically
     */
    bootstrapProvider: function() {
      if (this.isInitialized) return;
      this.isInitialized = true;

      const provider = this.config.provider;
      const id = this.config.measurementId;

      if (provider === 'ga4' && id && id !== 'YOUR_ANALYTICS_ID') {
        this.loadGoogleAnalytics(id);
      } else if (provider === 'plausible') {
        this.loadPlausible(id);
      } else if (provider === 'umami') {
        this.loadUmami(id);
      }

      this.trackPageView();
      this.attachEventListeners();
    },

    /**
     * Load Google Analytics 4 (GA4) dynamically without hardcoding external tags
     */
    loadGoogleAnalytics: function(measurementId) {
      if (window.gtag) return;

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', measurementId, {
        anonymize_ip: this.config.anonymizeIp,
        send_page_view: false // Manual control
      });

      if (this.config.debugMode) {
        console.info('[CineSphere Analytics] Google Analytics 4 initialized with ID:', measurementId);
      }
    },

    /**
     * Load Plausible Analytics dynamically
     */
    loadPlausible: function(domain) {
      const script = document.createElement('script');
      script.defer = true;
      script.setAttribute('data-domain', domain);
      script.src = this.config.apiEndpoint || 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
    },

    /**
     * Load Umami Analytics dynamically
     */
    loadUmami: function(websiteId) {
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.setAttribute('data-website-id', websiteId);
      script.src = this.config.apiEndpoint || 'https://analytics.umami.is/script.js';
      document.head.appendChild(script);
    },

    /**
     * Track standard page_view event
     */
    trackPageView: function(customPath, customTitle) {
      if (!this.canTrack()) return;

      const path = customPath || window.location.pathname;
      const title = customTitle || document.title;

      if (this.config.debugMode) {
        console.debug('[CineSphere Analytics] page_view:', { path, title });
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_location: window.location.href,
          page_path: path,
          page_title: title
        });
      } else if (typeof window.plausible === 'function') {
        window.plausible('pageview', { u: window.location.href });
      }
    },

    /**
     * Track generic custom event
     */
    trackEvent: function(eventName, eventParams) {
      if (!this.canTrack()) return;

      const params = Object.assign({
        timestamp: new Date().toISOString()
      }, eventParams || {});

      if (this.config.debugMode) {
        console.debug(`[CineSphere Analytics] event (${eventName}):`, params);
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      } else if (typeof window.plausible === 'function') {
        window.plausible(eventName, { props: params });
      }
    },

    /**
     * Dedicated Movie View Event
     */
    trackMovieView: function(movieData) {
      if (!movieData) return;
      this.trackEvent('movie_view', {
        movie_id: movieData.id || movieData.slug,
        movie_title: movieData.title,
        movie_slug: movieData.slug,
        category: movieData.category || (movieData.genre ? movieData.genre[0] : 'Cinema'),
        quality: movieData.quality || '1080p',
        language: movieData.language || 'English'
      });
    },

    /**
     * Dedicated Search Query Event
     */
    trackSearch: function(searchTerm, resultsCount) {
      if (!searchTerm) return;
      this.trackEvent('search', {
        search_term: searchTerm.trim().toLowerCase(),
        results_count: resultsCount !== undefined ? resultsCount : null
      });
    },

    /**
     * Dedicated Category View Event
     */
    trackCategoryView: function(categoryName, count) {
      if (!categoryName) return;
      this.trackEvent('category_view', {
        category: categoryName.toLowerCase(),
        movie_count: count || null
      });
    },

    /**
     * Dedicated Watch Button Click Event
     */
    trackWatchClick: function(movieId, movieTitle, movieSlug) {
      this.trackEvent('watch_click', {
        movie_id: movieId || movieSlug,
        movie_title: movieTitle || movieSlug,
        movie_slug: movieSlug,
        action: 'watch_online'
      });
    },

    /**
     * Dedicated Download Button Click Event
     */
    trackDownloadClick: function(movieId, movieTitle, movieSlug, quality) {
      this.trackEvent('download_click', {
        movie_id: movieId || movieSlug,
        movie_title: movieTitle || movieSlug,
        movie_slug: movieSlug,
        quality: quality || 'unknown',
        action: 'direct_download'
      });
    },

    /**
     * Dedicated External Link Click Event
     */
    trackExternalLink: function(url, label) {
      this.trackEvent('external_link_click', {
        link_url: url,
        link_label: label || 'external_link'
      });
    },

    /**
     * Automated DOM Click Listeners for Watch, Download, Categories, Search, and External links
     */
    attachEventListeners: function() {
      document.addEventListener('click', (e) => {
        // 1. Watch Buttons
        const watchBtn = e.target.closest('.btn-watch');
        if (watchBtn) {
          const card = watchBtn.closest('.movie-card');
          const slug = card ? card.getAttribute('data-slug') : (window.location.pathname.split('/')[2] || 'detail');
          const title = card ? (card.querySelector('.movie-title a')?.textContent || slug) : (document.querySelector('h1')?.textContent || slug);
          this.trackWatchClick(slug, title, slug);
          return;
        }

        // 2. Download Buttons
        const downloadBtn = e.target.closest('.btn-download, .cs-download-server-row .btn');
        if (downloadBtn) {
          const card = downloadBtn.closest('.movie-card') || downloadBtn.closest('.cs-action-box');
          const slug = card ? (card.getAttribute('data-slug') || window.location.pathname.split('/')[2] || 'detail') : 'detail';
          const title = card ? (card.querySelector('.movie-title a, .cs-detail-title')?.textContent || slug) : slug;
          this.trackDownloadClick(slug, title, slug, downloadBtn.textContent.trim());
          return;
        }

        // 3. Category pills
        const categoryPill = e.target.closest('.cs-category-pill');
        if (categoryPill) {
          const catName = categoryPill.textContent.trim().replace(/[0-9]/g, '').trim();
          this.trackCategoryView(catName);
          return;
        }

        // 4. Safe External Links
        const extLink = e.target.closest('a[target="_blank"]');
        if (extLink && extLink.href && !extLink.href.startsWith(window.location.origin)) {
          this.trackExternalLink(extLink.href, extLink.textContent.trim() || 'Outbound Link');
        }
      });
    },

    /**
     * Safety check for active tracking
     */
    canTrack: function() {
      if (!this.config || !this.config.analyticsEnabled) return false;
      if (this.config.consentRequired && this.consentState !== 'granted') return false;
      return true;
    },

    /**
     * Future Dashboard Specification Schema
     * Strictly specifies dashboard schema for real analytics provider integration.
     * Does NOT generate fake numbers.
     */
    getDashboardSpecification: function() {
      return {
        metricsSupported: [
          'total_users',
          'total_sessions',
          'today_visitors',
          'yesterday_visitors',
          'last_7_days',
          'last_30_days',
          'page_views',
          'popular_movie_pages',
          'popular_categories',
          'watch_button_clicks',
          'download_button_clicks',
          'search_activity',
          'traffic_sources',
          'countries',
          'devices',
          'browsers',
          'operating_systems'
        ],
        provider: this.config ? this.config.provider : 'unconfigured',
        status: (this.config && this.config.analyticsEnabled) ? 'active' : 'disabled_awaiting_real_credentials',
        notice: 'Real visitor analytics require connection to an external analytics provider. Static frontends do not calculate synthetic server counts.'
      };
    }
  };

  // Expose globally
  window.CineSphereAnalytics = CineSphereAnalytics;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CineSphereAnalytics.init());
  } else {
    CineSphereAnalytics.init();
  }

})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : {});
