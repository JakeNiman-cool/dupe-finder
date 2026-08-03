document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM Elements - Ensure these IDs match your index.html
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const resultsGrid = document.getElementById('results-grid');
  const loadingSpinner = document.getElementById('loading-spinner');
  const noResultsMsg = document.getElementById('no-results');

  if (!searchForm || !searchInput) {
    console.error('Search form or input element missing from HTML!');
    return;
  }

  // 2. Handle Form Submission
  searchForm.addEventListener('submit', async (e) => {
    // PREVENT PAGE RELOAD
    e.preventDefault();

    const query = searchInput.value.trim();
    if (!query) return;

    // Reset UI State
    if (resultsGrid) resultsGrid.innerHTML = '';
    if (noResultsMsg) noResultsMsg.classList.add('hidden');
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');

    try {
      // 3. Call your Netlify serverless search function
      const response = await fetch(`/.netlify/functions/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      // Hide loading spinner
      if (loadingSpinner) loadingSpinner.classList.add('hidden');

      // 4. Render or Display Error
      if (data.results && data.results.length > 0) {
        renderResults(data.results);
      } else {
        if (noResultsMsg) noResultsMsg.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Search request failed:', error);
      if (loadingSpinner) loadingSpinner.classList.add('hidden');
      if (noResultsMsg) {
        noResultsMsg.innerText = 'Failed to load search results. Please try again.';
        noResultsMsg.classList.remove('hidden');
      }
    }
  });

  // 5. Function to Render Product Cards
  function renderResults(products) {
    if (!resultsGrid) return;

    resultsGrid.innerHTML = products.map((product) => `
      <div class="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg hover:border-purple-500 transition-all duration-200 flex flex-col">
        <div class="w-full h-48 bg-slate-900 overflow-hidden flex items-center justify-center relative">
          <img 
            src="${product.image}" 
            alt="${escapeHtml(product.title)}" 
            class="w-full h-full object-contain p-4"
            onerror="this.onerror=null; this.src='https://via.placeholder.com/200?text=No+Image';"
          />
        </div>
        
        <div class="p-4 flex flex-col flex-grow justify-between">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-purple-400">
              ${escapeHtml(product.source)}
            </span>
            <h3 class="text-sm font-medium text-slate-100 mt-1 line-clamp-2 title="="${escapeHtml(product.title)}">
              ${escapeHtml(product.title)}
            </h3>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
            <span class="text-lg font-bold text-emerald-400">
              ${escapeHtml(product.formattedPrice)}
            </span>
            <a 
              href="${product.link}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
            >
              View Deal
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Utility helper to prevent HTML injection XSS issues
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
