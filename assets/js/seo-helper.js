/**
 * CineSphere - Centralized SEO & Structured Data Helper (Phase 3)
 * Pure Vanilla JavaScript Helper Module
 * 
 * Provides dynamic canonical URL generation, OpenGraph/Twitter card updates,
 * and Schema.org JSON-LD structured data management without framework overhead.
 */

(function(window) {
  'use strict';

  const BASE_URL = 'https://cinesphere.example.com';

  const CineSphereSEO = {
    BASE_URL: BASE_URL,

    /**
     * Clean path helper to maintain extensionless URLs
     * Strips trailing slashes, index.html, and .html extensions
     */
    cleanPath: function(path) {
      if (!path) return '/';
      let clean = String(path).trim();
      clean = clean.replace(/index\.html$/i, '');
      clean = clean.replace(/\.html$/i, '');
      clean = clean.replace(/\/+$/, '');
      return clean.startsWith('/') ? clean : '/' + clean;
    },

    /**
     * Generate canonical URL for any given path
     */
    getCanonicalUrl: function(path) {
      const clean = this.cleanPath(path || window.location.pathname);
      return clean === '/' ? `${BASE_URL}/` : `${BASE_URL}${clean}`;
    },

    /**
     * Centralized canonical tag manager (prevents duplicate tags)
     */
    setCanonical: function(pathOrUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      const targetUrl = (pathOrUrl && pathOrUrl.startsWith('http')) 
        ? pathOrUrl 
        : this.getCanonicalUrl(pathOrUrl);
      canonicalLink.setAttribute('href', targetUrl);
      return targetUrl;
    },

    /**
     * Set or update meta tags cleanly
     */
    setMetaTag: function(attrName, attrVal, content) {
      if (!content) return;
      let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    },

    /**
     * Batch update social metadata (Open Graph & Twitter)
     */
    setSocialMeta: function(meta) {
      if (!meta) return;
      if (meta.title) {
        this.setMetaTag('property', 'og:title', meta.title);
        this.setMetaTag('name', 'twitter:title', meta.title);
      }
      if (meta.description) {
        this.setMetaTag('name', 'description', meta.description);
        this.setMetaTag('property', 'og:description', meta.description);
        this.setMetaTag('name', 'twitter:description', meta.description);
      }
      if (meta.image) {
        this.setMetaTag('property', 'og:image', meta.image);
        this.setMetaTag('name', 'twitter:image', meta.image);
        this.setMetaTag('name', 'twitter:card', 'summary_large_image');
      }
      if (meta.url) {
        this.setMetaTag('property', 'og:url', meta.url);
      }
      if (meta.type) {
        this.setMetaTag('property', 'og:type', meta.type);
      }
    },

    /**
     * Convert human duration (e.g. "2h 46m" or "1h 59m") into ISO 8601 duration (e.g. "PT2H46M")
     */
    formatIsoDuration: function(durationStr) {
      if (!durationStr) return 'PT2H00M';
      const hoursMatch = durationStr.match(/(\d+)\s*h/i);
      const minsMatch = durationStr.match(/(\d+)\s*m/i);
      const hours = hoursMatch ? hoursMatch[1] : '0';
      const mins = minsMatch ? minsMatch[1] : '0';
      return `PT${hours}H${mins}M`;
    },

    /**
     * Generate Schema.org Movie JSON-LD
     * STRICT RULE: Do not invent ratings, reviews, awards, or fake aggregate ratings!
     */
    buildMovieSchema: function(movie) {
      if (!movie) return null;
      const canonicalUrl = `${BASE_URL}/movie/${movie.slug}`;

      const schema = {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": movie.title,
        "headline": movie.tagline || movie.title,
        "image": movie.poster,
        "description": movie.description,
        "url": canonicalUrl,
        "genre": Array.isArray(movie.genre) ? movie.genre : [movie.genre || movie.category],
        "duration": this.formatIsoDuration(movie.duration)
      };

      if (movie.releaseDate) {
        schema.datePublished = movie.releaseDate;
      }
      if (movie.year) {
        schema.copyrightYear = movie.year;
      }
      if (movie.country) {
        schema.countryOfOrigin = {
          "@type": "Country",
          "name": movie.country
        };
      }
      if (movie.director) {
        schema.director = {
          "@type": "Person",
          "name": movie.director
        };
      }
      if (Array.isArray(movie.cast) && movie.cast.length > 0) {
        schema.actor = movie.cast.map(actorName => ({
          "@type": "Person",
          "name": actorName
        }));
      }

      return schema;
    },

    /**
     * Generate Schema.org BreadcrumbList JSON-LD
     * crumbs: [{ name: 'Home', path: '/' }, { name: 'Movies', path: '/movies' }, ...]
     */
    buildBreadcrumbsSchema: function(crumbs) {
      if (!Array.isArray(crumbs) || crumbs.length === 0) return null;
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": crumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.path.startsWith('http') ? crumb.path : `${BASE_URL}${this.cleanPath(crumb.path)}`
        }))
      };
    },

    /**
     * Generate Website level schema with search action
     */
    buildWebSiteSchema: function() {
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "CineSphere",
        "url": `${BASE_URL}/`,
        "description": "Discover, explore, and stream the latest high-definition movies in 4K UHD and 1080p.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      };
    },

    /**
     * Inject or update JSON-LD script block safely
     */
    injectJsonLd: function(id, schemaObject) {
      if (!schemaObject) return;
      let scriptTag = document.getElementById(id);
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        scriptTag.id = id;
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schemaObject, null, 2);
    }
  };

  // Expose globally
  window.CineSphereSEO = CineSphereSEO;

})(window);
