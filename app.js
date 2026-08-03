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

        // SMART SORTING: Prioritize items that have both a price and an image so the best options pop up first!
        items.sort((a, b) => {
          const hasImageA = (a.imageUrl || a.thumbnail || a.image || a.photo) ? 1 : 0;
          const hasImageB = (b.imageUrl || b.thumbnail || b.image || b.photo) ? 1 : 0;
          const hasPriceA = a.price ? 1 : 0;
          const hasPriceB = b.price ? 1 : 0;

          // Score items based on completeness
          const scoreA = hasImageA + hasPriceA;
          const scoreB = hasImageB + hasPriceB;

          return scoreB - scoreA; // Higher score comes first
        });

        if (items.length === 0) {
          if (noResults) noResults.classList.remove("hidden");
        } else {
          renderResults(items);
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (loadingSpinner) loadingSpinner.classList.add("hidden");
        if (noResults) noResults.classList.remove("hidden");
      }
    });
  }

  function renderResults(items) {
    if (!resultsGrid) return;
    resultsGrid.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "cartoony-card bg-white rounded-3xl p-5 flex flex-col justify-between";
      
      const imageUrl = item.imageUrl || item.thumbnail || item.image || item.photo;

      const imageSection = imageUrl ? `
        <div class="w-full h-48 bg-amber-100 rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-2 border-2 border-slate-900">
          <img src="${imageUrl}" alt="${item.title}" class="max-h-full max-w-full object-contain hover:scale-110 transition-transform duration-300" />
        </div>
      ` : '';

      card.innerHTML = `
        <div>
          ${imageSection}
          <h3 class="font-bold text-slate-900 hover:text-pink-600 transition-colors mb-2 line-clamp-2 text-base">
            <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
          </h3>
          <p class="text-pink-600 font-black text-xl mb-3">${item.price || "Check site for price"}</p>
        </div>
        <div class="pt-4 border-t-2 border-slate-100 flex items-center justify-between text-xs">
          <span class="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg font-bold border border-slate-900 truncate max-w-[120px]">${item.source || "Store"}</span>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="cartoony-button px-4 py-2 bg-yellow-300 text-slate-900 rounded-xl font-bold text-xs hover:bg-yellow-400">
            Grab Deal 🛒
          </a>
        </div>
      `;
      
      resultsGrid.appendChild(card);
    });
  }
});
