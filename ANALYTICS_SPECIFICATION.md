# CineSphere — Real Visitor Analytics & Statistics Specification (Phase 5)

## 1. Overview & Architecture Philosophy
CineSphere is a static frontend architecture (HTML5, CSS3, Vanilla JavaScript, Bootstrap 5). In accordance with production-grade engineering standards and strict compliance rules:

- **Zero Fake Statistics**: CineSphere **never** simulates or invents visitor counts, random numbers, client-side localStorage counters, or fake "live online users" widgets.
- **Provider-Based Telemetry**: Because static client browsers cannot independently know global server hits, unique IP deduplication, or concurrent active sessions across different devices, all authentic analytics must originate from a legitimate external analytics service.
- **Privacy-First & Lightweight**: The analytics layer is completely decoupled, asynchronous, and disabled by default (`analyticsEnabled: false`). When disabled, zero external tracking scripts are loaded, and the site functions with zero overhead.

---

## 2. Activation Guide for Site Owner

To activate real analytics on CineSphere, edit `/assets/js/analytics-config.js`:

```javascript
window.CineSphereAnalyticsConfig = {
  analyticsEnabled: true,
  provider: 'ga4', // Options: 'ga4' | 'plausible' | 'umami' | 'cloudflare'
  measurementId: 'G-XXXXXXXXXX', // Replace with your real GA4 Measurement ID
  apiEndpoint: '', // Optional endpoint for self-hosted Umami/Plausible
  debugMode: false,
  consentRequired: false, // Set to true if GDPR/CCPA cookie banner is needed
  environment: 'production'
};
```

### Supported Providers
1. **Google Analytics 4 (GA4)**: Standard web analytics using measurement ID `G-XXXXXXXXXX`.
2. **Plausible Analytics**: Lightweight, privacy-focused alternative with no cookies.
3. **Umami Analytics**: Self-hosted or cloud open-source analytics.
4. **Cloudflare Web Analytics**: Privacy-first token-based analytics.

---

## 3. Future Analytics Dashboard Specification

When the site owner connects a real analytics provider API or backend service (e.g., Google Analytics Data API, Umami API, or a lightweight Cloudflare Worker), the following metrics and dimensions are pre-configured in the telemetry schema:

### Overview Metric Cards
- **Total Users**: Unique visitor count over the selected time period.
- **Total Sessions**: Total browsing sessions initiated.
- **Today**: Real-time / today's unique visitors.
- **Yesterday**: Full previous day unique visitors.
- **Last 7 Days**: Trailing 7-day visitor volume.
- **Last 30 Days**: Trailing 30-day visitor volume.
- **Total Page Views**: Aggregated page impressions across all catalog pages.

### Content Performance & Engagement
- **Popular Movie Pages**: Top movies ranked by `movie_view` events (e.g., `/movie/dune-2`, `/movie/oppenheimer`).
- **Popular Categories**: Top genres ranked by `category_view` events (Action, Sci-Fi, Adventure, etc.).
- **Watch Button Clicks**: High-intent interactions via `watch_click` event (tracked per movie slug and title).
- **Download Button Clicks**: Conversion interactions via `download_click` event (tracked per movie slug, quality, and server mirror).
- **Search Activity**: Common queries captured via `search` event (`search_term` and `results_count`) to identify catalog demand.

### Audience & Acquisition Dimensions
- **Traffic Sources**: Direct, Organic Search (Google, Bing, DuckDuckGo), Social, Referrals.
- **Geographic Distribution**: Top countries and regions by traffic volume.
- **Device Categories**: Desktop, Mobile, Tablet breakdowns.
- **Browsers**: Chrome, Safari, Firefox, Edge, Samsung Internet.
- **Operating Systems**: Android, iOS, Windows, macOS, Linux.

---

## 4. Telemetry Event Schema Reference

| Event Name | Trigger Condition | Parameters Sent |
|---|---|---|
| `page_view` | Page load / dynamic route change | `page_location`, `page_path`, `page_title` |
| `movie_view` | User opens a movie detail page | `movie_id`, `movie_title`, `movie_slug`, `category`, `quality`, `language` |
| `search` | User performs a search in `#liveSearchInput` or `#headerSearchInput` | `search_term`, `results_count` |
| `category_view` | User navigates to a genre archive or clicks category pill | `category`, `movie_count` |
| `watch_click` | User clicks "Watch Online Now" or "Watch Now" | `movie_id`, `movie_title`, `movie_slug`, `action: "watch_online"` |
| `download_click` | User clicks a download mirror button | `movie_id`, `movie_title`, `movie_slug`, `quality`, `action: "direct_download"` |
| `external_link_click` | User clicks an outbound link opening in a new tab | `link_url`, `link_label` |

---

## 5. Security, GDPR & Consent Handling
- **No Personally Identifiable Information (PII)**: Events never collect IP addresses, email addresses, names, or device fingerprints.
- **Consent Banner**: When `consentRequired: true`, a discreet bottom banner allows users to "Accept" or "Decline" telemetry. Choice is remembered in `localStorage` under `cinesphere_analytics_consent` with no tracking active until accepted.
- **Public Widget Safety**: If a public metrics card or widget is deployed in future phases, it remains disabled by default until authenticated API credentials are provided.
