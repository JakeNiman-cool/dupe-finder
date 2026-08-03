document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const genderSelect = document.getElementById("gender-select");
  const sizeSelect = document.getElementById("size-select");
  const loadingSpinner = document.getElementById("loading-spinner");
  const noResults = document.getElementById("no-results");
  const resultsGrid = document.getElementById("results-grid");
  const filterContainer = document.getElementById("filter-container");
  const recentTagsContainer = document.getElementById("recent-tags");

  let allItems = [];
  let currentFilter = 'all';
  let activeCategory = '';

  // --- Size Hover Options Handler ---
  document.querySelectorAll(".size-opt").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const selectedSize = btn.dataset.size;
      const selectedGender = btn.dataset.gender || '';
      const selectedCat = btn.dataset.category || '';

      if (genderSelect && selectedGender) genderSelect.value = selectedGender;
      if (sizeSelect) sizeSelect.value = selectedSize;
      if (selectedCat) activeCategory = selectedCat;

      if (searchInput.value.trim()) {
        performSearch(searchInput.value.trim());
      }
    });
  });

  // --- Load Recent Searches ---
  function loadRecentSearches() {
    if (!recentTagsContainer) return;
    const history = JSON.parse(localStorage.getItem("recent_searches") || "[]");
    recentTagsContainer.innerHTML = "";

    if (history.length === 0) {
      recentTagsContainer.innerHTML = `<span class="text-slate-400 text-xs">No recent searches</span>`;
      return;
    }

    history.forEach(term => {
      const tag = document.createElement("button");
      tag.className = "cartoony-button bg-yellow-200 hover:bg-yellow-300 text-slate-900 text-xs px-2.5 py-1 rounded-xl font-bold border-2 border-slate-900";
      tag.textContent = term;
      tag.addEventListener("click", () => {
        searchInput.value = term;
        performSearch(term);
      });
      recentTagsContainer.appendChild(tag);
    });
  }

  function saveRecentSearch(term) {
    let history = JSON.parse(localStorage.getItem("recent_searches") || "[]");
    history = history.filter(item => item.toLowerCase() !== term.toLowerCase());
    history.unshift(term);
    if (history.length > 5) history.pop();
    localStorage.setItem("recent_searches", JSON.stringify(history));
    loadRecentSearches();
  }

  loadRecentSearches();

  // --- Sidebar Selection ---
  if (filterContainer) {
    const filterButtons = filterContainer.querySelectorAll("button[data-filter]");
    
    filterButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        filterButtons.forEach(b => {
          b.className = "w-full text-left cartoony-button bg-white hover:bg-amber-50 text-slate-900 font-black px-4 py-3 rounded-2xl flex items-center gap-2";
          const iconSpan = b.querySelector("span");
          if (iconSpan) {
            iconSpan.className = "w-5 h-5 rounded-full border-2 border-slate-900";
            iconSpan.innerHTML = "";
          }
        });

        const target = e.currentTarget;
        target.className = "w-full text-left cartoony-button bg-blue-500 text-white font-black px-4 py-3 rounded-2xl flex items-center gap-2 ring-4 ring-slate-900 scale-105";
        const targetIcon = target.querySelector("span");
        if (targetIcon) {
          targetIcon.className = "w-5 h-5 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center text-xs text-slate-900";
          targetIcon.innerHTML = "✓";
        }

        const filterType = target.dataset.filter;
        applyFilter(filterType);
      });
    });
  }

  // --- Perform Search ---
  async function performSearch(rawQuery) {
    if (!rawQuery) return;

    saveRecentSearch(rawQuery);

    if (loadingSpinner) loadingSpinner.classList.remove("hidden");
    if (noResults) noResults.classList.add("hidden");
    if (resultsGrid) resultsGrid.innerHTML = "";

    try {
      const gender = genderSelect ? genderSelect.value : '';
      const size = sizeSelect ? sizeSelect.value : '';

      const url = `/api/search?query=${encodeURIComponent(rawQuery)}&category=${encodeURIComponent(activeCategory)}&gender=${encodeURIComponent(gender)}&size=${encodeURIComponent(size)}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (loadingSpinner) loadingSpinner.classList.add("hidden");

      allItems = data.shopping || [];

      function extractPrice(priceStr) {
        if (!priceStr) return Infinity;
        const match = String(priceStr).replace(/[^0-9.]/g, '').match(/[\d.]+/);
        return match ? parseFloat(match[0]) : Infinity;
      }

      allItems.sort((a, b) => extractPrice(a.price) - extractPrice(b.price));

      if (allItems.length === 0) {
        if (noResults) noResults.classList.remove("hidden");
      } else {
        applyFilter(currentFilter);
      }
    } catch (error) {
      console.error("Search failed:", error);
      if (loadingSpinner) loadingSpinner.classList.add("hidden");
      if (noResults) noResults.classList.add("hidden");
    }
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      performSearch(searchInput.value.trim());
    });
  }

  // --- Apply Filters ---
  function applyFilter(type) {
    currentFilter = type;
    if (!allItems.length) return;

    let filtered = [...allItems];

    const getNum = priceStr => {
      if (!priceStr) return 0;
      const match = String(priceStr).replace(/[^0-9.]/g, '').match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    const isSecondHandStore = (sourceStr) => {
      const src = (sourceStr || '').toLowerCase();
      return ['ebay', 'poshmark', 'depop', 'vinted', 'mercari', 'thredup', 'grailed', 'thrift', 'goodwill', 'realreal'].some(m => src.includes(m));
    };

    const textMatch = (item, keywords) => {
      const text = ((item.title || '') + ' ' + (item.source || '')).toLowerCase();
      return keywords.some(k => text.includes(k));
    };

    if (type === 'trending') {
      filtered = filtered.filter(i => (i.rating || i.reviews) || textMatch(i, ['amazon', 'sephora', 'nike', 'nordstrom', 'target']));
      if (!filtered.length) filtered = [...allItems];
    } else if (type === 'low-to-high') {
      filtered.sort((a, b) => getNum(a.price) - getNum(b.price));
    } else if (type === 'high-to-low') {
      filtered.sort((a, b) => getNum(b.price) - getNum(a.price));
    } else if (type === 'dupe') {
      const validPrices = allItems.map(i => getNum(i.price)).filter(p => p > 0);
      const medianPrice = validPrices.length ? validPrices[Math.floor(validPrices.length / 2)] : Infinity;

      filtered = filtered.filter(i => getNum(i.price) <= medianPrice || textMatch(i, ['amazon', 'target', 'wayfair', 'walmart', 'shein', 'temu', 'ebay']));
      filtered.sort((a, b) => getNum(a.price) - getNum(b.price));
    } else if (type === 'new') {
      filtered = filtered.filter(i => !isSecondHandStore(i.source) && !textMatch(i, ['used', 'pre-owned', 'secondhand', 'refurbished', 'vintage']));
      filtered.sort((a, b) => getNum(a.price) - getNum(b.price));
    } else if (type === 'used') {
      filtered = filtered.filter(i => isSecondHandStore(i.source) || textMatch(i, ['used', 'pre-owned', 'secondhand', 'vintage', 'refurbished']));
      filtered.sort((a, b) => getNum(a.price) - getNum(b.price));
    } else if (type === 'real') {
      filtered = filtered.filter(i => textMatch(i, ['authentic', 'real', 'original', 'official', 'genuine']));
      filtered.sort((a, b) => getNum(a.price) - getNum(b.price));
    } else {
      filtered.sort((a, b) => getNum(a.price) - getNum(b.price));
    }

    renderResults(filtered.length > 0 ? filtered : allItems, type);
  }

  // --- Render Product Cards ---
  function renderResults(items, activeType) {
    if (!resultsGrid) return;
    resultsGrid.innerHTML = "";

    if (items.length === 0) {
      if (noResults) noResults.classList.remove("hidden");
      return;
    } else {
      if (noResults) noResults.classList.add("hidden");
    }

    items.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "cartoony-card bg-white rounded-3xl p-5 flex flex-col justify-between relative transition-all duration-200";
      
      const imageUrl = item.imageUrl || item.thumbnail || item.image || item.photo;

      let badgeHTML = '';
      if (activeType === 'trending' && index === 0) {
        badgeHTML = `
          <div class="absolute -top-3 -right-2 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] rotate-3 z-20">
            🔥 TRENDING ITEM
          </div>
        `;
      } else if (activeType === 'high-to-low' && index === 0) {
        badgeHTML = `
          <div class="absolute -top-3 -right-2 bg-purple-600 text-white text-xs font-black px-3 py-1 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] rotate-3 z-20">
            👑 HIGHEST PRICE
          </div>
        `;
      } else {
        if (index === 0) {
          badgeHTML = `
            <div class="absolute -top-3 -right-2 bg-yellow-300 text-slate-900 text-xs font-black px-3 py-1 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] rotate-3 z-20">
              🔥 ABSOLUTE LOWEST PRICE
            </div>
          `;
        } else if (index === 1) {
          badgeHTML = `
            <div class="absolute -top-3 -right-2 bg-pink-500 text-white text-xs font-black px-3 py-1 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] -rotate-2 z-20">
              💸 CRAZY CHEAP DEAL
            </div>
          `;
        }
      }

      const imageSection = imageUrl ? `
        <div class="w-full h-48 bg-amber-50 rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-2 border-2 border-slate-900">
          <img src="${imageUrl}" alt="${item.title || 'Product'}" class="max-h-full max-w-full object-contain hover:scale-110 transition-transform duration-300" />
        </div>
      ` : '';

      card.innerHTML = `
        <div>
          ${badgeHTML}
          ${imageSection}
          <h3 class="text-slate-900 hover:text-pink-600 transition-colors mb-2 line-clamp-2 text-base font-bold">
            <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
          </h3>
          <p class="text-pink-600 text-2xl font-black mb-3">${item.price || "Check site"}</p>
        </div>
        <div class="pt-4 border-t-2 border-slate-100 flex items-center justify-between text-sm">
          <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-xl border-2 border-slate-900 font-bold truncate max-w-[110px]">${item.source || "Store"}</span>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="cartoony-button px-3 py-1.5 bg-yellow-300 text-slate-900 font-bold text-xs rounded-xl hover:bg-yellow-400 border-2 border-slate-900">
            Grab Deal 🛒
          </a>
        </div>
      `;
      
      resultsGrid.appendChild(card);
    });
  }
});
