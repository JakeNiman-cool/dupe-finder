document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const loadingSpinner = document.getElementById("loading-spinner");
  const noResults = document.getElementById("no-results");
  const resultsGrid = document.getElementById("results-grid");

  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      
      if (!query) return;

      if (loadingSpinner) loadingSpinner.classList.remove("hidden");
      if (noResults) noResults.classList.add("hidden");
      if (resultsGrid) resultsGrid.innerHTML = "";

      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (loadingSpinner) loadingSpinner.classList.add("hidden");

        let items = data.shopping || [];

        // Helper function to extract a clean number from price strings
        function extractPrice(priceStr) {
          if (!priceStr) return Infinity;
          const match = priceStr.replace(/,/g, '').match(/[\d.]+/);
          return match ? parseFloat(match[0]) : Infinity;
        }

        // Sort items to put the ones with images and lowest prices strictly on top
        items.sort((a, b) => {
          const hasImageA = (a.imageUrl || a.thumbnail || a.image || a.photo) ? 1 : 0;
          const hasImageB = (b.imageUrl || b.thumbnail || b.image || b.photo) ? 1 : 0;

          if (hasImageA !== hasImageB) {
            return hasImageB - hasImageA;
          }

          const priceA = extractPrice(a.price);
          const priceB = extractPrice(b.price);

          return priceA - priceB;
        });

        if (items.length === 0) {
          if (noResults) noResults.classList.remove("hidden");
        } else {
          renderResults(items);
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (loadingSpinner) loadingSpinner.classList.add("hidden");
        if (noResults) noResults.classList.add("hidden");
      }
    });
  }

  function renderResults(items) {
    if (!resultsGrid) return;
    resultsGrid.innerHTML = "";

    // Calculate the average or baseline price of these results to estimate savings
    const validPrices = items.map(i => {
      const m = (i.price || '').replace(/,/g, '').match(/[\d.]+/);
      return m ? parseFloat(m[0]) : null;
    }).filter(p => p !== null && p > 0);

    const avgPrice = validPrices.length > 0 ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : 50;

    items.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "cartoony-card bg-white rounded-3xl p-5 flex flex-col justify-between relative";
      
      const imageUrl = item.imageUrl || item.thumbnail || item.image || item.photo;

      // Determine extreme bargain tags based on position or price depth
      let badgeHTML = '';
      const priceMatch = (item.price || '').replace(/,/g, '').match(/[\d.]+/);
      const numericPrice = priceMatch ? parseFloat(priceMatch[0]) : null;

      if (index === 0) {
        badgeHTML = `
          <div class="absolute -top-3 -right-2 bg-pink-500 text-white text-sm font-black px-3.5 py-1.5 rounded-full border-3 border-slate-900 shadow-[2px_2px_0px_#1e293b] rotate-3 z-20">
            🔥 (BEST DEAL)
          </div>
        `;
      } else if (numericPrice && numericPrice < (avgPrice * 0.4)) {
        badgeHTML = `
          <div class="absolute -top-3 -right-2 bg-yellow-300 text-slate-900 text-sm font-black px-3.5 py-1.5 rounded-full border-3 border-slate-900 shadow-[2px_2px_0px_#1e293b] -rotate-3 z-20">
            💸 (80% OFF)
          </div>
        `;
      } else if (index === 1) {
        badgeHTML = `
          <div class="absolute -top-3 -right-2 bg-purple-500 text-white text-sm font-black px-3.5 py-1.5 rounded-full border-3 border-slate-900 shadow-[2px_2px_0px_#1e293b] rotate-2 z-20">
            ✨ (SUPER CHEAP)
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
