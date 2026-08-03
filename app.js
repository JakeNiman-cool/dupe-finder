document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const loadingSpinner = document.getElementById("loading-spinner");
  const noResults = document.getElementById("no-results");
  const resultsGrid = document.getElementById("results-grid");
  const filterContainer = document.getElementById("filter-container");

  let allItems = [];
  let currentFilter = 'all';
  let currentSort = 'low-high'; // default sort

  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rawQuery = searchInput.value.trim();
      
      if (!rawQuery) return;

      if (loadingSpinner) loadingSpinner.classList.remove("hidden");
      if (noResults) noResults.classList.add("hidden");
      if (resultsGrid) resultsGrid.innerHTML = "";
      if (filterContainer) filterContainer.classList.add("hidden");

      try {
        let query = rawQuery;
        const lowerQ = rawQuery.toLowerCase();
        
        // Handle specific item intents or ensure marketplace terms are included to catch eBay/Vinted results
        if (lowerQ.includes('hand couch') || lowerQ.includes('hand chair')) {
          query = 'Pedro Friedeberg wooden hand chair sculpture ebay vinted';
        } else if (!lowerQ.includes('ebay') && !lowerQ.includes('vinted')) {
          query = `${rawQuery} site:ebay.co.uk OR site:vinted.co.uk OR ${rawQuery}`;
        }

        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (loadingSpinner) loadingSpinner.classList.add("hidden");

        allItems = data.shopping || [];

        function extractPrice(priceStr) {
          if (!priceStr) return Infinity;
          const match = priceStr.replace(/[^0-9.]/g, '').match(/[\d.]+/);
          return match ? parseFloat(match[0]) : Infinity;
        }

        // Filter out expensive luxury resale platforms
        const excludedSources = ['stockx', 'goat', 'farfetch', 'flight club', 'stadium goods', '1stdibs'];
        allItems = allItems.filter(item => {
          const sourceName = (item.source || '').toLowerCase();
          return !excludedSources.some(exc => sourceName.includes(exc));
        });

        if (allItems.length === 0) {
          if (noResults) noResults.classList.remove("hidden");
        } else {
          if (filterContainer) {
            filterContainer.classList.remove("hidden");
            injectSortDropdown(); // add sort dropdown to the sidebar UI
          }
          applyFilter(currentFilter, currentSort);
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (loadingSpinner) loadingSpinner.classList.add("hidden");
        if (noResults) noResults.classList.add("hidden");
      }
    });
  }

  // Inject Sort dropdown dynamically into the sidebar filter container
  function injectSortDropdown() {
    let sortWrapper = document.getElementById("sort-dropdown-wrapper");
    if (!sortWrapper && filterContainer) {
      sortWrapper = document.createElement("div");
      sortWrapper.id = "sort-dropdown-wrapper";
      sortWrapper.className = "mt-6 pt-6 border-t-2 border-slate-100";
      sortWrapper.innerHTML = `
        <h4 class="text-xl text-slate-900 mb-3">🔄 Sort Order</h4>
        <select id="sort-select" onchange="window.changeSort(this.value)" class="w-full p-3 bg-white border-2 border-slate-900 rounded-xl font-bold text-slate-900 shadow-[2px_2px_0px_#1e293b] focus:outline-none">
          <option value="low-high">Price: Low to High 📈</option>
          <option value="high-low">Price: High to Low 📉</option>
        </select>
      `;
      filterContainer.appendChild(sortWrapper);
    }
  }

  window.changeSort = function(sortVal) {
    currentSort = sortVal;
    applyFilter(currentFilter, currentSort);
  };

  window.applyFilter = function(type, sortVal = currentSort) {
    currentFilter = type;
    if (!allItems.length) return;

    let filtered = [...allItems];
    const textMatch = (item, keywords) => {
      const text = (item.title + ' ' + (item.source || '')).toLowerCase();
      return keywords.some(k => text.includes(k));
    };

    if (type === 'new') {
      filtered = filtered.filter(i => textMatch(i, ['new', 'brand new', 'factory', 'sealed']));
    } else if (type === 'used') {
      filtered = filtered.filter(i => textMatch(i, ['used', 'pre-owned', 'second hand', 'vintage', 'refurbished', 'ebay', 'vinted', '70s', '1970']));
    } else if (type === 'dupe') {
      filtered = filtered.filter(i => textMatch(i, ['dupe', 'alternative', 'style', 'inspired', 'replica']));
    } else if (type === 'real') {
      filtered = filtered.filter(i => textMatch(i, ['authentic', 'real', 'original', 'genuine']));
    }

    const getNum = p => {
      const m = (p || '').replace(/[^0-9.]/g, '').match(/[\d.]+/);
      return m ? parseFloat(m[0]) : Infinity;
    };

    // Apply Low to High or High to Low sorting
    filtered.sort((a, b) => {
      const priceA = getNum(a.price);
      const priceB = getNum(b.price);
      if (sortVal === 'high-low') {
        return priceB - priceA;
      }
      return priceA - priceB;
    });

    renderResults(filtered.length > 0 ? filtered : allItems);
  };

  function renderResults(items) {
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
      if (index === 0 && currentSort === 'low-high') {
        badgeHTML = `
          <div class="absolute -top-3 -right-2 bg-yellow-300 text-slate-900 text-sm font-black px-3.5 py-1.5 rounded-full border-3 border-slate-900 shadow-[2px_2px_0px_#1e293b] rotate-3 z-20">
            🔥 ABSOLUTE LOWEST PRICE
          </div>
        `;
      } else if (index === 1 && currentSort === 'low-high') {
        badgeHTML = `
          <div class="absolute -top-3 -right-2 bg-pink-500 text-white text-sm font-black px-3.5 py-1.5 rounded-full border-3 border-slate-900 shadow-[2px_2px_0px_#1e293b] -rotate-2 z-20">
            💸 CRAZY CHEAP DEAL
          </div>
        `;
      }

      const imageSection = imageUrl ? `
        <div class="w-full h-48 bg-amber-50 rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-2 border-2 border-slate-900">
          <img src="${imageUrl}" alt="${item.title}" class="max-h-full max-w-full object-contain hover:scale-110 transition-transform duration-300" />
        </div>
      ` : '';

      card.innerHTML = `
        <div>
          ${badgeHTML}
          ${imageSection}
          <h3 class="text-slate-900 hover:text-pink-600 transition-colors mb-2 line-clamp-2 text-lg">
            <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
          </h3>
          <p class="text-pink-600 text-2xl mb-3">${item.price || "Check site for price"}</p>
        </div>
        <div class="pt-4 border-t-2 border-slate-100 flex items-center justify-between text-sm">
          <span class="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl border-2 border-slate-900 truncate max-w-[120px]">${item.source || "Store"}</span>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="cartoony-button px-4 py-2 bg-yellow-300 text-slate-900 rounded-xl hover:bg-yellow-400">
            Grab Deal 🛒
          </a>
        </div>
      `;
      
      resultsGrid.appendChild(card);
    });
  }
});
