/**
 * Cineza - Centralized Advertisement & Monetization Configuration (Phase 4)
 * Pure Vanilla JavaScript - No Frontend Frameworks
 * 
 * This file governs all advertisement slots, frequency capping, responsive behavior,
 * and future Adsterra / monetization integration hooks.
 * 
 * IMPORTANT:
 * - Real publisher codes and scripts are not hardcoded.
 * - Clear placeholder comments are provided for future real script insertion.
 * - Popups and interstitials are STRICTLY DISABLED by default (popup: false).
 */

(function () {
  'use strict';

  /**
   * Centralized Configuration Object
   */
  const AD_CONFIG = {
    // Master switch for all advertisements on the platform
    enabled: true,

    // Planned provider identification (e.g. 'adsterra', 'direct')
    provider: 'adsterra',

    // Granular toggle for every ad slot location across the site
    slots: {
      topBanner: true,             // Top Banner (728x90, 970x90, 320x50 on mobile)
      heroBanner: true,            // Hero / Banner ad below hero or header
      sidebar: true,               // Sidebar ad (300x250 medium rectangle or 300x600)
      inContent: true,             // In-content ads between content sections
      betweenSections: true,       // Banner ads between major movie sections
      beforeWatchDownload: true,   // Specific slot placed safely before Watch/Download buttons
      listingInContent: true,      // Mid-catalog / mid-grid in-content banner
      detailInContent: true,       // Inside movie detail specifications
      bottomBanner: true,          // Bottom billboard / footer banner (970x90 or 728x90)
      mobileBanner: true,          // Mobile-specific responsive sticky or inline banner
      popup: false                 // Popup / Interstitial (STRICTLY DISABLED BY DEFAULT)
    },

    // Frequency capping & UX protection controls
    frequency: {
      popupCooldownMinutes: 60,         // Minimum minutes between popups for a returning user
      maxPopupsPerSession: 1,           // Maximum times a popup can ever trigger per session
      pageLoadDelaySeconds: 15,         // Delay after page load before an eligible popup triggers
      minTimeBetweenDisplaysSeconds: 30 // Minimum gap between major animated or dynamic ads
    },

    // UI & Accessibility labeling
    labels: {
      badgeText: 'ADVERTISEMENT',
      sponsoredNotice: 'Sponsored Partner Placement',
      closeAriaLabel: 'Close advertisement'
    },

    // Standard ad slot dimension specifications
    dimensions: {
      'top-banner': { desktop: '728×90 / 970×90', mobile: '320×50', name: 'Responsive Leaderboard' },
      'hero-banner': { desktop: '970×90 / 970×250', mobile: '300×100', name: 'Hero Billboard' },
      'sidebar': { desktop: '300×250 / 300×600', mobile: 'Responsive 100%', name: 'Sidebar Medium Rectangle' },
      'in-content': { desktop: '728×90 / 970×90', mobile: '300×250', name: 'In-Content Banner' },
      'listing-in-content': { desktop: '728×90', mobile: '320×50 / 300×250', name: 'Listing Feed In-Content' },
      'detail-in-content': { desktop: '728×90', mobile: '300×100', name: 'Movie Detail In-Content' },
      'before-watch-download': { desktop: '728×90', mobile: '320×50', name: 'Pre-Download Verification Banner' },
      'between-sections': { desktop: '970×90 / 728×90', mobile: '300×100', name: 'Between-Sections Billboard' },
      'bottom-banner': { desktop: '970×90', mobile: '320×50', name: 'Bottom Billboard' },
      'mobile-banner': { desktop: 'Hidden on Desktop', mobile: '320×50 / 300×50', name: 'Mobile Sticky/Inline Banner' },
      'interstitial-popup': { desktop: '640×480 Interstitial', mobile: '300×350 Modal', name: 'Interstitial Overlay' }
    }
  };

  /**
   * Cineza Ad Manager Class
   */
  class CinezaAdManager {
    constructor(config) {
      this.config = config;
      this.initialized = false;
      this.popupTimer = null;
    }

    /**
     * Initializes all ad slots on the page based on configuration
     */
    init() {
      if (this.initialized) return;
      this.initialized = true;

      // Apply master switch
      if (!this.config.enabled) {
        this.disableAllSlots();
        return;
      }

      this.processAllSlots();
      this.initInterstitialInfrastructure();
    }

    /**
     * Checks if a specific slot type is currently enabled in config
     */
    isSlotEnabled(slotType) {
      if (!this.config.enabled) return false;
      
      switch (slotType) {
        case 'top-banner':
          return !!this.config.slots.topBanner;
        case 'hero-banner':
          return !!this.config.slots.heroBanner;
        case 'sidebar':
          return !!this.config.slots.sidebar;
        case 'in-content':
          return !!this.config.slots.inContent;
        case 'between-sections':
          return !!this.config.slots.betweenSections;
        case 'before-watch-download':
          return !!this.config.slots.beforeWatchDownload;
        case 'listing-in-content':
          return !!this.config.slots.listingInContent;
        case 'detail-in-content':
          return !!this.config.slots.detailInContent;
        case 'bottom-banner':
          return !!this.config.slots.bottomBanner;
        case 'mobile-banner':
          return !!this.config.slots.mobileBanner;
        case 'interstitial-popup':
          return !!this.config.slots.popup;
        default:
          return true;
      }
    }

    /**
     * Scans DOM for all ad slot elements and applies visibility/placeholders
     */
    processAllSlots() {
      const adSlots = document.querySelectorAll('.cs-ad-container, [data-ad-type]');

      adSlots.forEach((slotEl) => {
        const slotType = slotEl.getAttribute('data-ad-type');
        if (!slotType) return;

        const isEnabled = this.isSlotEnabled(slotType);

        if (!isEnabled) {
          slotEl.style.display = 'none';
          slotEl.setAttribute('aria-hidden', 'true');
        } else {
          slotEl.style.display = '';
          slotEl.removeAttribute('aria-hidden');
          this.ensureAccessibleAdAttributes(slotEl, slotType);
        }
      });
    }

    /**
     * Ensures ARIA and accessibility attributes on ad containers
     */
    ensureAccessibleAdAttributes(slotEl, slotType) {
      if (!slotEl.getAttribute('role') && slotEl.tagName.toLowerCase() !== 'aside') {
        slotEl.setAttribute('role', 'complementary');
      }
      if (!slotEl.getAttribute('aria-label')) {
        const formattedName = slotType.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        slotEl.setAttribute('aria-label', `${formattedName} Advertisement`);
      }
    }

    /**
     * Disables and hides all slots on the page
     */
    disableAllSlots() {
      const adSlots = document.querySelectorAll('.cs-ad-container, [data-ad-type]');
      adSlots.forEach(el => {
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
      });
    }

    /**
     * Interstitial / Popup Infrastructure
     * STRICTLY respects UX guardrails:
     * - Disabled by default (popup: false)
     * - Cooldown check (session & local storage)
     * - Never triggers immediately on load
     * - Clear close button, ESC key handler, backdrop click
     * - Never redirects or blocks user navigation
     */
    initInterstitialInfrastructure() {
      // 1. Check if popup is enabled in config
      if (!this.config.slots.popup) {
        // Ensure modal element (if present in DOM) stays completely hidden
        const modal = document.getElementById('csInterstitialModal');
        if (modal) {
          modal.style.display = 'none';
          modal.setAttribute('aria-hidden', 'true');
        }
        return;
      }

      // 2. Frequency Check: Session count
      try {
        const sessionCount = parseInt(sessionStorage.getItem('cs_ad_popup_count') || '0', 10);
        if (sessionCount >= this.config.frequency.maxPopupsPerSession) {
          return;
        }

        // 3. Cooldown Check: Local storage timestamp
        const lastPopup = parseInt(localStorage.getItem('cs_ad_last_popup_time') || '0', 10);
        const cooldownMs = this.config.frequency.popupCooldownMinutes * 60 * 1000;
        if (Date.now() - lastPopup < cooldownMs) {
          return;
        }
      } catch (err) {
        // Storage access fallback
      }

      // 4. Page Load Delay (non-intrusive)
      const delayMs = Math.max(5000, this.config.frequency.pageLoadDelaySeconds * 1000);
      this.popupTimer = setTimeout(() => {
        this.showInterstitial();
      }, delayMs);
    }

    /**
     * Displays the interstitial modal safely
     */
    showInterstitial() {
      const modal = document.getElementById('csInterstitialModal');
      if (!modal) return;

      modal.classList.remove('d-none');
      modal.setAttribute('aria-hidden', 'false');
      modal.focus();

      // Record display in storage
      try {
        const count = parseInt(sessionStorage.getItem('cs_ad_popup_count') || '0', 10);
        sessionStorage.setItem('cs_ad_popup_count', String(count + 1));
        localStorage.setItem('cs_ad_last_popup_time', String(Date.now()));
      } catch (e) {}

      // Attach close listeners
      const closeBtn = document.getElementById('csInterstitialCloseBtn');
      const dismissBtn = document.getElementById('csInterstitialDismissBtn');

      const handleClose = () => {
        this.closeInterstitial();
      };

      if (closeBtn) closeBtn.onclick = handleClose;
      if (dismissBtn) dismissBtn.onclick = handleClose;

      // Close on backdrop click
      modal.onclick = (e) => {
        if (e.target === modal) {
          handleClose();
        }
      };

      // Close on ESC key
      const keyListener = (e) => {
        if (e.key === 'Escape') {
          handleClose();
          document.removeEventListener('keydown', keyListener);
        }
      };
      document.addEventListener('keydown', keyListener);
    }

    /**
     * Closes the interstitial modal
     */
    closeInterstitial() {
      const modal = document.getElementById('csInterstitialModal');
      if (!modal) return;
      modal.classList.add('d-none');
      modal.setAttribute('aria-hidden', 'true');
    }

    /**
     * Public method to dynamically register or update slot visibility
     */
    toggleSlot(slotName, state) {
      if (this.config.slots.hasOwnProperty(slotName)) {
        this.config.slots[slotName] = !!state;
        this.processAllSlots();
      }
    }
  }

  // Instantiate and expose globally on window
  window.AD_CONFIG = AD_CONFIG;
  window.CinezaAds = new CinezaAdManager(AD_CONFIG);

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.CinezaAds.init();
    });
  } else {
    window.CinezaAds.init();
  }

})();
