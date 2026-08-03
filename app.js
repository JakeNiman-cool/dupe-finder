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

      // 1. Show loading spinner, clear old results & error message
      if (loadingSpinner) loadingSpinner.classList.remove("hidden");
      if (noResults) noResults.classList.add("hidden");
      if (resultsGrid) resultsGrid.innerHTML = "";

      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        // Hide loading spinner
        if (loadingSpinner) loadingSpinner.classList.add("hidden");

        // Grab organic search results from backend
        const items = data.organic || [];

        if (items.length === 0) {
          // Show "No dupes found" box
          if (noResults) noResults.classList.remove("hidden");
        } else {
          // Render results into your grid
          renderResults(items);
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (loadingSpinner) loadingSpinner.classList.add("hidden");
        if (noResults) {
          noResults.classList.remove("hidden");
        }
      }
    });
  }

  function renderResults(items) {
    if (!resultsGrid) return;
    
    resultsGrid.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("div");
      // Tailwind styling to match your dark slate theme perfectly
      card.className = "bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-lg group";
      
      card.innerHTML = `
        <div>
          <h3 class="font-semibold text-slate-100 group-hover:text-purple-400 transition-colors mb-2 line-clamp-2">
            <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
          </h3>
          <p class="text-slate-400 text-xs line-clamp-3 mb-4">${item.snippet || "No description available."}</p>
        </div>
        <div class="pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
          <span class="text-slate-500 truncate max-w-[150px]">${item.displayed_link || "Direct Link"}</span>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600 hover:text-white transition-all font-medium">
            View Deal &rarr;
          </a>
        </div>
      `;
      
      resultsGrid.appendChild(card);
    });
  }
});
