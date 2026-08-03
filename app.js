document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const genderSelect = document.getElementById('gender-select');
  const sizeSelect = document.getElementById('size-select');
  const resultsGrid = document.getElementById('results-grid');
  const loadingSpinner = document.getElementById('loading-spinner');
  const noResultsDiv = document.getElementById('no-results');
  const recentTagsContainer = document.getElementById('recent-tags');
  const clearRecentsBtn = document.getElementById('clear-recents-btn');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');

  let currentResults = [];
  let activeFilterType = 'all';

  // Load Search History from Local Storage
  function getRecentSearches() {
    try {
      return JSON.parse(localStorage.getItem('dupespotter_recents')) || [];
    } catch {
      return [];
    }
  }

  function saveRecentSearch(keyword) {
    if (!keyword.trim()) return;
    let recents = getRecentSearches();
    recents = [keyword, ...recents.filter(item => item.toLowerCase() !== keyword.toLowerCase())].slice(0, 5);
    localStorage.setItem('dupespotter_recents', JSON.stringify(recents));
    renderRecentTags();
  }

  function renderRecentTags() {
    const recents = getRecentSearches();
    recentTagsContainer.innerHTML = '';
    
    if (recents.length === 0) {
      recentTagsContainer.innerHTML = '<span class="text-slate-400 text-xs italic">No recent searches</span>';
      return;
    }

    recents.forEach(term => {
      const tag = document.createElement('button');
      tag.type = 'button';
      tag.className = 'cartoony-button bg-white hover:bg-pink-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-lg transition-colors';
      tag.textContent = term;
      tag.addEventListener('click', () => {
        searchInput.value = term;
        executeSearch(term);
      });
      recentTagsContainer.appendChild(tag);
    });
  }

  clearRecentsBtn.addEventListener('click', () => {
    localStorage.removeItem('dupespotter_recents');
    renderRecentTags();
  });

  clearFiltersBtn.addEventListener('click', () => {
    genderSelect.value = '';
    sizeSelect.value = '';
    searchInput.value = '';
    resultsGrid.innerHTML = '';
    noResultsDiv.classList.add('hidden');
  });

  // Category & Size Dropdown Quick-Select Click Listeners
  document.querySelectorAll('.size-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const gender = opt.getAttribute('data-gender');
      const size = opt.getAttribute('data-size');
      const category = opt.getAttribute('data-category');

      if (gender) genderSelect.value = gender;
      if (size) sizeSelect.value = size;

      let queryText = category || gender || 'trending fashion';
      searchInput.value = queryText;
      executeSearch(queryText);
    });
  });

  document.querySelectorAll('[data-category]').forEach(btn => {
    if (btn.classList.contains('size-opt')) return;
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      searchInput.value = cat;
      executeSearch(cat);
    });
  });

  // Sidebar Filter Selection Handler (Including Trending Now)
  document.querySelectorAll('#filter-container button').forEach(button => {
    button.addEventListener('click', () => {
      const filterType = button.getAttribute('data-filter');
      activeFilterType = filterType;

      // Update active styling on sidebar
      document.querySelectorAll('#filter-container button').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white', 'scale-105');
        btn.classList.add('bg-white', 'text-slate-800');
        const checkIcon = btn.querySelector('span:first-child');
        if (checkIcon) checkIcon.textContent = '';
      });

      button.classList.add('bg-blue-500', 'text-white', 'scale-105');
      button.classList.remove('bg-white', 'text-slate-800');
      const activeCheck = button.querySelector('span:first-child');
      if (activeCheck) activeCheck.textContent = '✓';

      if (filterType === 'trending') {
        searchInput.value = 'viral trending bestselling items';
        executeSearch('viral trending bestselling items');
      } else {
        applyLocalSortingAndFiltering();
      }
    });
  });

  // Main Search Form Trigger
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      saveRecentSearch(query);
      executeSearch(query);
    }
  });

  // Core Search Fetch Function
  async function executeSearch(query) {
    loadingSpinner.classList.remove('hidden');
    noResultsDiv.classList.add('hidden');
    resultsGrid.innerHTML = '';

    const gender = genderSelect.value;
    const size = sizeSelect.value;

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, gender, size })
      });

      const data = await response.json();
      currentResults = data.results || [];

      loadingSpinner.classList.add('hidden');

      if (currentResults.length === 0) {
        noResultsDiv.classList.remove('hidden');
      } else {
        applyLocalSortingAndFiltering();
      }
    } catch (err) {
      console.error('Search error:', err);
      loadingSpinner.classList.add('hidden');
      noResultsDiv.classList.remove('hidden');
    }
  }

  // Local Post-Processing and Sorting
  function applyLocalSortingAndFiltering() {
    let processed = [...currentResults];

    if (activeFilterType === 'low-to-high') {
      processed.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (activeFilterType === 'high-to-low') {
      processed.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }

    renderResults(processed);
  }

  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  }

  // Render Grid Cards with Retail Platform Badges
  function renderResults(items) {
    resultsGrid.innerHTML = '';
    if (items.length === 0) {
      noResultsDiv.classList.remove('hidden');
      return;
    }

    noResultsDiv.classList.add('hidden');

    items.forEach(item => {
      let badgeColor = 'bg-slate-800 text-white';
      const platform = (item.sourcePlatform || '').toUpperCase();
      if (platform === 'TEMU') badgeColor = 'bg-orange-500 text-white';
      else if (platform === 'ETSY') badgeColor = 'bg-amber-700 text-white';
      else if (platform === 'ALIEXPRESS') badgeColor = 'bg-red-600 text-white';
      else if (platform === 'EBAY') badgeColor = 'bg-blue-600 text-white';

      const card = document.createElement('div');
      card.className = 'cartoony-card bg-white rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden';
      card.innerHTML = `
        <span class="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${badgeColor} shadow-sm z-10">
          ${platform || 'DEAL'}
        </span>

        <div>
          <div class="h-44 w-full bg-slate-50 rounded-xl mb-3 overflow-hidden flex items-center justify-center p-2">
            <img src="${item.thumbnail}" alt="${item.title}" class="object-contain h-full w-full hover:scale-105 transition-transform" loading="lazy" />
          </div>
          <h3 class="font-extrabold text-sm text-slate-900 line-clamp-2 mb-1">${item.title}</h3>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="font-black text-pink-600 text-base">${item.price || 'Check Site'}</span>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="cartoony-button bg-yellow-300 hover:bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1.5 rounded-xl">
            View Deal ↗
          </a>
        </div>
      `;
      resultsGrid.appendChild(card);
    });
  }

  // Initialize initial state tags
  renderRecentTags();
});
