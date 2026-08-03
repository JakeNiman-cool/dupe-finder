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

        const items = data.shopping || [];

        // Debug log the first item to inspect keys
        if (items.length > 0) {
          console.log("FIRST SHOPPING ITEM KEYS:", Object.keys(items[0]));
          console.log("FIRST SHOPPING ITEM DATA:", items[0]);
        }

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
      card.className = "bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-lg group";
      
      // Check multiple possible key names for the image URL
      const imageUrl = item.imageUrl || item.thumbnail || item.image || item.photo;

      const imageSection = imageUrl ? `
        <div class="w-full h-48 bg-slate-900/50 rounded-xl overflow-hidden mb-4 flex items-center justify-center p-2 border border-slate-700/50">
          <img src="${imageUrl}" alt="${item.title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </div>
      ` : '';

      card.innerHTML = `
        <div>
          ${imageSection}
          <h3 class="font-semibold text-slate-100 group-hover:text-purple-400 transition-colors mb-2 line-clamp-2">
            <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
          </h3>
          <p class="text-purple-400 font-bold text-lg mb-2">${item.price || ""}</p>
        </div>
        <div class="pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
          <span class="text-slate-500 truncate max-w-[150px]">${item.source || "Online Store"}</span>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600 hover:text-white transition-all font-medium">
            View Deal &rarr;
          </a>
        </div>
      `;
      
      resultsGrid.appendChild(card);
    });
  }
});
