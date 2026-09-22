/**
 * CineSphere - Main Vanilla JavaScript (Phase 2)
 * Pure Vanilla JS & Bootstrap 5 - No Frontend Frameworks
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderSearch();
  initCardInteractions();
  initHomePage();
  initDynamicMovieDetail();
  initCategoryPage();
  initLatestPage();
  initPopularPage();
  initSearchPage();
});

/**
 * Navigation active state helper (Handles clean extensionless paths)
 */
function initNavigation() {
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const navLinks = document.querySelectorAll('.cs-nav-link');

  navLinks.forEach(link => {
    const linkPath = (link.getAttribute('href') || '').replace(/\/+$/, '') || '/';
    if (linkPath === currentPath) {
      link.classList.add('active');
    } else if (linkPath !== '/' && currentPath.startsWith(linkPath)) {
      link.classList.add('active');
    }
  });
}

/**
 * Header quick search bar (redirects to /search?q=...)
 */
function initHeaderSearch() {
  const headerSearchInput = document.getElementById('headerSearchInput');
  if (!headerSearchInput) return;

  headerSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = headerSearchInput.value.trim();
      if (query) {
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      } else {
        window.location.href = '/search';
      }
    }
  });
}

/**
 * Standard Reusable Movie Card HTML Generator
 * Strict adherence to Phase 1 design:
 * - 2:3 aspect ratio poster with fallback
 * - Quality badge, rating badge, dual-audio badge
 * - Watch Now (using movie.watchUrl)
 * - Download (using movie.downloadUrl or movie page download anchor)
 * - ABSOLUTELY ZERO TRAILER UI
 * - Clean URL: /movie/${movie.slug}
 */
function createMovieCardHTML(movie) {
  if (!movie) return '';
  const qualityBadge = movie.quality && movie.quality.includes('4K') ? 'badge-4k' : '';
  const primaryGenre = movie.genre && movie.genre.length ? movie.genre[0] : (movie.category || 'Cinema');
  const fallbackImg = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
  const isDual = movie.language && movie.language.toLowerCase().includes('dual');

  return `
    <article class="movie-card" data-slug="${movie.slug}" data-genres="${(movie.genre || []).join(',').toLowerCase()}">
      <div class="movie-poster-wrap">
        <img 
          src="${movie.poster}" 
          alt="${movie.title} (${movie.year}) official poster" 
          class="movie-poster" 
          width="300"
          height="450"
          loading="lazy"
          onerror="this.onerror=null;this.src='${fallbackImg}';"
        />
        <span class="badge-overlay-quality ${qualityBadge}">${movie.quality || '1080p'}</span>
        <span class="badge-overlay-rating"><i class="bi bi-star-fill"></i> ${movie.rating || '8.0'}</span>
        ${isDual ? '<span class="badge-overlay-lang">Dual Audio</span>' : ''}
        
        <div class="movie-overlay-actions">
          <a href="${movie.watchUrl || `/movie/${movie.slug}`}" class="btn btn-watch btn-sm-action" target="_blank" rel="noopener noreferrer" aria-label="Watch ${movie.title} Now">
            <i class="bi bi-play-fill"></i> Watch Now
          </a>
          <a href="/movie/${movie.slug}#download" class="btn btn-download btn-sm-action" aria-label="Download ${movie.title}">
            <i class="bi bi-download"></i> Download
          </a>
        </div>
      </div>
      <div class="movie-info">
        <h3 class="movie-title">
          <a href="/movie/${movie.slug}" title="${movie.title}">${movie.title}</a>
        </h3>
        <div class="movie-meta">
          <span>${movie.year}</span>
          <span class="movie-meta-dot"></span>
          <span>${primaryGenre}</span>
          <span class="movie-meta-dot"></span>
          <span>${movie.duration}</span>
        </div>
      </div>
    </article>
  `;
}

/**
 * Card clickability: clicking card body navigates directly to clean movie URL
 */
function initCardInteractions() {
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.movie-card');
    if (!card) return;
    
    // Do not intercept if clicked directly on an anchor or button inside the card
    if (e.target.closest('a') || e.target.closest('button')) return;

    const slug = card.getAttribute('data-slug');
    if (slug) {
      window.location.href = `/movie/${slug}`;
    }
  });
}

/**
 * Reusable Client-Side Pagination Renderer
 * Provides:
 * 1. Desktop: Previous, 1, 2, 3, Next
 * 2. Mobile: Compact '< Page X / Y >'
 * 3. Load More button option
 */
function renderPagination(container, totalItems, itemsPerPage, currentPage, onPageChange) {
  if (!container) return;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <nav class="cs-pagination-wrapper d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mt-4" aria-label="Movie Catalog Pagination">
      <div class="text-secondary small">
        Showing <strong>${(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>${Math.min(currentPage * itemsPerPage, totalItems)}</strong> of <strong>${totalItems}</strong> movies
      </div>

      <!-- Desktop Pagination -->
      <ul class="pagination pagination-sm mb-0 d-none d-md-flex">
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
          <button class="page-link cs-page-btn" data-page="${currentPage - 1}" aria-label="Previous Page">
            <i class="bi bi-chevron-left"></i> Previous
          </button>
        </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <button class="page-link cs-page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      </li>
    `;
  }

  html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
          <button class="page-link cs-page-btn" data-page="${currentPage + 1}" aria-label="Next Page">
            Next <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>

      <!-- Mobile Pagination -->
      <div class="d-flex d-md-none align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary text-white cs-page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
          <i class="bi bi-chevron-left"></i> Prev
        </button>
        <span class="text-white small px-2">Page ${currentPage} of ${totalPages}</span>
        <button class="btn btn-sm btn-outline-secondary text-white cs-page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
          Next <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </nav>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.cs-page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const page = parseInt(btn.getAttribute('data-page'), 10);
      if (page && page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
        window.scrollTo({ top: 180, behavior: 'smooth' });
      }
    });
  });
}

/**
 * 11. Connect Phase 1 Homepage to Centralized Movie Data
 */
function initHomePage() {
  const homeTrendingGrid = document.getElementById('homeTrendingGrid');
  const homeLatestGrid = document.getElementById('homeLatestGrid');
  const homePopularGrid = document.getElementById('homePopularGrid');
  const homeRecommendedGrid = document.getElementById('homeRecommendedGrid');

  if (typeof MOVIES_DATABASE === 'undefined') return;

  if (homeTrendingGrid) {
    const trending = MOVIES_DATABASE.filter(m => m.trending).slice(0, 6);
    homeTrendingGrid.innerHTML = trending.map(createMovieCardHTML).join('');
  }

  if (homeLatestGrid) {
    const latest = getLatestMovies(6);
    homeLatestGrid.innerHTML = latest.map(createMovieCardHTML).join('');
  }

  if (homePopularGrid) {
    const popular = getPopularMovies(6);
    homePopularGrid.innerHTML = popular.map(createMovieCardHTML).join('');
  }

  if (homeRecommendedGrid) {
    const recommended = MOVIES_DATABASE.slice(4, 10);
    homeRecommendedGrid.innerHTML = recommended.map(createMovieCardHTML).join('');
  }
}

/**
 * 3. Movie Detail Page Controller
 * Reads slug from pathname or query param, populates movie info & SEO tags dynamically.
 * If movie not found, displays a professional "Movie Not Found" state.
 */
function initDynamicMovieDetail() {
  const container = document.getElementById('dynamicMovieDetailContainer');
  if (!container || typeof MOVIES_DATABASE === 'undefined') return;

  // Extract slug from path (e.g. /movie/interstellar or /movie/?slug=...)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  let slug = '';
  if (pathParts.length >= 2 && pathParts[0] === 'movie') {
    slug = pathParts[1];
  } else {
    const params = new URLSearchParams(window.location.search);
    slug = params.get('slug') || params.get('id') || '';
  }

  const movie = getMovieBySlug(slug) || (slug ? null : MOVIES_DATABASE[0]);

  if (!movie) {
    renderMovieNotFound(container, slug);
    return;
  }

  populateMovieDetailPage(movie);
}

function renderMovieNotFound(container, slug) {
  document.title = "Movie Not Found | CineSphere";
  container.innerHTML = `
    <div class="text-center py-5">
      <div class="display-1 text-danger mb-3"><i class="bi bi-exclamation-triangle"></i></div>
      <h1 class="h2 text-white fw-bold mb-2">Movie Not Found</h1>
      <p class="text-secondary max-w-md mx-auto mb-4">
        The movie <em>"${escapeHTML(slug)}"</em> could not be located in the catalog, or it may have been moved.
      </p>
      <div class="d-flex justify-content-center gap-3 mb-5">
        <a href="/" class="btn btn-watch"><i class="bi bi-house-door me-1"></i> Return Home</a>
        <a href="/movies" class="btn btn-download"><i class="bi bi-collection-play me-1"></i> Browse All Movies</a>
        <a href="/search" class="btn btn-outline-secondary text-white"><i class="bi bi-search me-1"></i> Search Catalog</a>
      </div>

      <div class="cs-section-header text-start mt-5">
        <h2 class="cs-section-title">Popular Movies You Might Like</h2>
      </div>
      <div class="movie-grid">
        ${getPopularMovies(4).map(createMovieCardHTML).join('')}
      </div>
    </div>
  `;
}

function populateMovieDetailPage(movie) {
  // Update SEO Title & Meta Tags dynamically
  document.title = `${movie.title} (${movie.year}) - Watch Online & 4K Download Links | CineSphere`;
  const canonicalUrl = `https://cinesphere.example.com/movie/${movie.slug}`;
  
  if (window.CineSphereSEO) {
    window.CineSphereSEO.setCanonical(canonicalUrl);
    window.CineSphereSEO.setSocialMeta({
      title: `${movie.title} (${movie.year}) | CineSphere`,
      description: `Watch ${movie.title} (${movie.year}) online in 4K UHD and download high-speed direct mirrors. Directed by ${movie.director}.`,
      image: movie.poster,
      url: canonicalUrl,
      type: 'video.movie'
    });

    // Inject Schema.org Movie structured data
    const movieSchema = window.CineSphereSEO.buildMovieSchema(movie);
    window.CineSphereSEO.injectJsonLd('movieJsonLd', movieSchema);

    // Inject Schema.org BreadcrumbList structured data
    const breadcrumbsSchema = window.CineSphereSEO.buildBreadcrumbsSchema([
      { name: 'Home', path: '/' },
      { name: 'Movies', path: '/movies' },
      { name: `${movie.title} (${movie.year})`, path: `/movie/${movie.slug}` }
    ]);
    window.CineSphereSEO.injectJsonLd('breadcrumbJsonLd', breadcrumbsSchema);
  } else {
    updateMetaTag('name', 'description', `Watch ${movie.title} (${movie.year}) online in 4K UHD and download high-speed direct mirrors. Directed by ${movie.director}, starring ${movie.cast.slice(0, 3).join(', ')}.`);
    updateMetaTag('property', 'og:title', `${movie.title} (${movie.year}) | CineSphere`);
    updateMetaTag('property', 'og:description', movie.description);
    updateMetaTag('property', 'og:image', movie.poster);
    updateMetaTag('property', 'og:url', canonicalUrl);
  }

  // Breadcrumbs
  const breadcrumbEl = document.getElementById('detailBreadcrumbTitle');
  if (breadcrumbEl) breadcrumbEl.textContent = `${movie.title} (${movie.year})`;

  // Backdrop and Poster (Image SEO: Descriptive alt text & dimensions)
  const backdropEl = document.getElementById('detailMovieBackdrop');
  if (backdropEl) {
    backdropEl.src = movie.backdrop || movie.poster;
    backdropEl.alt = `${movie.title} (${movie.year}) official backdrop scene`;
  }
  const posterEl = document.getElementById('detailMoviePoster');
  if (posterEl) {
    posterEl.src = movie.poster;
    posterEl.alt = `${movie.title} (${movie.year}) official poster`;
    posterEl.width = 300;
    posterEl.height = 450;
  }

  // Titles & Badges
  const titleEl = document.getElementById('detailMovieTitle');
  if (titleEl) titleEl.textContent = movie.title;
  const taglineEl = document.getElementById('detailMovieTagline');
  if (taglineEl) taglineEl.textContent = movie.tagline ? `"${movie.tagline}"` : '';

  const qualityEl = document.getElementById('detailMovieQuality');
  if (qualityEl) qualityEl.textContent = movie.quality || '4K UHD';
  const ratingEl = document.getElementById('detailMovieRating');
  if (ratingEl) ratingEl.textContent = movie.rating || '8.0';

  const yearEl = document.getElementById('detailMovieYear');
  if (yearEl) yearEl.textContent = movie.year;
  const durationEl = document.getElementById('detailMovieDuration');
  if (durationEl) durationEl.textContent = movie.duration;
  const descEl = document.getElementById('detailMovieDescription');
  if (descEl) descEl.textContent = movie.description;

  // Metadata items
  const directorEl = document.getElementById('detailMovieDirector');
  if (directorEl) directorEl.textContent = movie.director;
  const castEl = document.getElementById('detailMovieCast');
  if (castEl) castEl.textContent = Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast;
  const audioEl = document.getElementById('detailMovieAudio');
  if (audioEl) audioEl.textContent = movie.audio || 'Dolby Digital 5.1';
  const codecEl = document.getElementById('detailMovieCodec');
  if (codecEl) codecEl.textContent = movie.codec || 'x265 HEVC';
  const sizeEl = document.getElementById('detailMovieSize');
  if (sizeEl) sizeEl.textContent = movie.fileSize || '12.5 GB';
  const langEl = document.getElementById('detailMovieLanguage');
  if (langEl) langEl.textContent = movie.language || 'English';
  const countryEl = document.getElementById('detailMovieCountry');
  if (countryEl) countryEl.textContent = movie.country || 'USA';

  // Genres Badges
  const genresEl = document.getElementById('detailMovieGenres');
  if (genresEl && movie.genre) {
    genresEl.innerHTML = movie.genre.map(g => 
      `<a href="/category/${g.toLowerCase()}" class="cs-category-pill">${g}</a>`
    ).join(' ');
  }

  // Watch Now & Download Action Buttons (ZERO TRAILER UI)
  const watchBtn = document.getElementById('detailWatchNowBtn');
  if (watchBtn) {
    watchBtn.href = movie.watchUrl || '#';
    watchBtn.setAttribute('target', '_blank');
    watchBtn.setAttribute('rel', 'noopener noreferrer');
  }

  const downloadBtn = document.getElementById('detailDownloadBtn');
  if (downloadBtn) {
    downloadBtn.href = movie.downloadUrl || '#download';
  }

  // Related Movies (4-8 items based on same genre/category)
  const relatedGrid = document.getElementById('relatedMoviesGrid');
  if (relatedGrid) {
    const related = getRelatedMovies(movie.slug, 4);
    relatedGrid.innerHTML = related.map(createMovieCardHTML).join('');
  }
}

/**
 * 5. Category Pages Controller
 * Populates movies filtered by category with pagination.
 */
function initCategoryPage() {
  const categoryGrid = document.getElementById('categoryMoviesGrid');
  const paginationContainer = document.getElementById('categoryPagination');
  if (!categoryGrid || typeof MOVIES_DATABASE === 'undefined') return;

  // Determine category from path or query parameter
  // e.g. /category/action or /category?name=action
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  let categorySlug = '';
  if (pathParts.length >= 2 && pathParts[0] === 'category') {
    categorySlug = pathParts[1];
  } else {
    const params = new URLSearchParams(window.location.search);
    categorySlug = params.get('name') || params.get('cat') || 'action';
  }

  const allCategoryMovies = getMoviesByCategory(categorySlug);
  const titleEl = document.getElementById('categoryPageTitle');
  const countEl = document.getElementById('categoryPageCount');
  const descEl = document.getElementById('categoryPageDesc');

  const catMeta = (typeof CATEGORIES_DATABASE !== 'undefined') ? 
    CATEGORIES_DATABASE.find(c => c.slug === categorySlug.toLowerCase()) : null;

  if (titleEl) {
    const displayName = catMeta ? catMeta.name : (categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1));
    titleEl.innerHTML = `<i class="bi ${catMeta ? catMeta.icon : 'bi-collection-play'} text-danger me-2"></i> ${displayName} Movies`;
    document.title = `${displayName} Movies - Watch Online & 4K Downloads | CineSphere`;

    if (window.CineSphereSEO) {
      window.CineSphereSEO.setCanonical(`/category/${categorySlug}`);
      window.CineSphereSEO.setSocialMeta({
        title: `${displayName} Movies | CineSphere`,
        description: catMeta ? catMeta.description : `Browse top-rated ${displayName} movies.`,
        url: `https://cinesphere.example.com/category/${categorySlug}`,
        type: 'website'
      });
      const crumbs = window.CineSphereSEO.buildBreadcrumbsSchema([
        { name: 'Home', path: '/' },
        { name: 'Categories', path: '/categories' },
        { name: `${displayName} Movies`, path: `/category/${categorySlug}` }
      ]);
      window.CineSphereSEO.injectJsonLd('categoryBreadcrumbJsonLd', crumbs);
    }
  }

  if (descEl && catMeta) {
    descEl.textContent = catMeta.description;
  }

  if (countEl) {
    countEl.textContent = `${allCategoryMovies.length} movie${allCategoryMovies.length !== 1 ? 's' : ''} available`;
  }

  let currentPage = 1;
  const itemsPerPage = 8;

  function renderPage(page) {
    currentPage = page;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagedMovies = allCategoryMovies.slice(start, end);

    if (pagedMovies.length === 0) {
      categoryGrid.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-secondary">No movies currently listed under this category.</p>
          <a href="/movies" class="btn btn-watch btn-sm-action">Browse All Movies</a>
        </div>
      `;
    } else {
      categoryGrid.innerHTML = pagedMovies.map(createMovieCardHTML).join('');
    }

    if (paginationContainer) {
      renderPagination(paginationContainer, allCategoryMovies.length, itemsPerPage, currentPage, renderPage);
    }
  }

  renderPage(1);
}

/**
 * 6. Latest Movies Page Controller (/latest)
 * Sorted by releaseDate descending with pagination
 */
function initLatestPage() {
  const latestGrid = document.getElementById('latestMoviesGrid');
  const paginationContainer = document.getElementById('latestPagination');
  if (!latestGrid || typeof MOVIES_DATABASE === 'undefined') return;

  const allLatest = getLatestMovies();
  let currentPage = 1;
  const itemsPerPage = 8;

  function renderPage(page) {
    currentPage = page;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagedMovies = allLatest.slice(start, end);

    latestGrid.innerHTML = pagedMovies.map(createMovieCardHTML).join('');

    if (paginationContainer) {
      renderPagination(paginationContainer, allLatest.length, itemsPerPage, currentPage, renderPage);
    }
  }

  renderPage(1);
}

/**
 * 7. Popular Movies Page Controller (/popular)
 * Sorted by popularity descending with pagination
 */
function initPopularPage() {
  const popularGrid = document.getElementById('popularMoviesGrid');
  const paginationContainer = document.getElementById('popularPagination');
  if (!popularGrid || typeof MOVIES_DATABASE === 'undefined') return;

  const allPopular = getPopularMovies();
  let currentPage = 1;
  const itemsPerPage = 8;

  function renderPage(page) {
    currentPage = page;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagedMovies = allPopular.slice(start, end);

    popularGrid.innerHTML = pagedMovies.map(createMovieCardHTML).join('');

    if (paginationContainer) {
      renderPagination(paginationContainer, allPopular.length, itemsPerPage, currentPage, renderPage);
    }
  }

  renderPage(1);
}

/**
 * 8. Search Page Controller (/search?q=...)
 * Client-side search matching Title, Genre, Language, Year, Category, Cast, Director.
 */
function initSearchPage() {
  const searchInput = document.getElementById('liveSearchInput');
  const resultsGrid = document.getElementById('searchResultsGrid');
  const countSpan = document.getElementById('searchResultsCount');
  const emptyState = document.getElementById('noResultsState');
  const genreSelect = document.getElementById('genreFilterSelect');
  const qualitySelect = document.getElementById('qualityFilterSelect');
  const sortSelect = document.getElementById('sortFilterSelect');
  const resetBtn = document.getElementById('resetFiltersBtn');
  const clearBtn = document.getElementById('clearSearchBtn');

  if (!resultsGrid || typeof MOVIES_DATABASE === 'undefined') return;

  // Initialize query from URL search parameter e.g. /search?q=avatar
  const urlParams = new URLSearchParams(window.location.search);
  const initialQ = urlParams.get('q') || '';
  const initialGenre = urlParams.get('genre') || 'all';

  if (searchInput && initialQ) {
    searchInput.value = initialQ;
  }
  if (genreSelect && initialGenre !== 'all') {
    genreSelect.value = initialGenre.toLowerCase();
  }

  function filterAndDisplay() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const genre = genreSelect ? genreSelect.value.toLowerCase() : 'all';
    const quality = qualitySelect ? qualitySelect.value : 'all';
    const sort = sortSelect ? sortSelect.value : 'popular';

    let filtered = MOVIES_DATABASE.filter(m => {
      // Query matching
      const matchesQuery = !query || 
        m.title.toLowerCase().includes(query) ||
        (m.director && m.director.toLowerCase().includes(query)) ||
        (m.category && m.category.toLowerCase().includes(query)) ||
        (m.language && m.language.toLowerCase().includes(query)) ||
        String(m.year).includes(query) ||
        (m.cast && m.cast.some(actor => actor.toLowerCase().includes(query))) ||
        (m.genre && m.genre.some(g => g.toLowerCase().includes(query)));

      // Genre matching
      const matchesGenre = (genre === 'all') || 
        (m.genre && m.genre.some(g => g.toLowerCase() === genre)) ||
        (m.category && m.category.toLowerCase() === genre);

      // Quality matching
      const matchesQuality = (quality === 'all') || (m.quality && m.quality.includes(quality));

      return matchesQuery && matchesGenre && matchesQuality;
    });

    // Sorting
    if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'year-desc') {
      filtered.sort((a, b) => b.year - a.year);
    } else if (sort === 'year-asc') {
      filtered.sort((a, b) => a.year - b.year);
    } else if (sort === 'title-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      filtered.sort((a, b) => b.popularity - a.popularity);
    }

    if (countSpan) countSpan.textContent = filtered.length;

    if (filtered.length === 0) {
      resultsGrid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
    } else {
      if (emptyState) emptyState.classList.add('d-none');
      resultsGrid.innerHTML = filtered.map(createMovieCardHTML).join('');
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterAndDisplay);
  if (genreSelect) genreSelect.addEventListener('change', filterAndDisplay);
  if (qualitySelect) qualitySelect.addEventListener('change', filterAndDisplay);
  if (sortSelect) sortSelect.addEventListener('change', filterAndDisplay);

  function resetAll() {
    if (searchInput) searchInput.value = '';
    if (genreSelect) genreSelect.value = 'all';
    if (qualitySelect) qualitySelect.value = 'all';
    if (sortSelect) sortSelect.value = 'popular';
    filterAndDisplay();
  }

  if (resetBtn) resetBtn.addEventListener('click', resetAll);
  if (clearBtn) clearBtn.addEventListener('click', resetAll);

  // Initial execution
  filterAndDisplay();
}

/**
 * Utility helpers
 */
function updateMetaTag(attributeName, attributeValue, content) {
  let tag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attributeName, attributeValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
