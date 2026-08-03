document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const resultsGrid = document.getElementById('results-grid');
  const loadingSpinner = document.getElementById('loading-spinner');
  const noResults = document.getElementById('no-results');

  searchForm.addEventListener('submit', async (e) => {
    // PREVENT PAGE RELOAD
    e.preventDefault();

    const query = searchInput.value.trim();
    if (!query) return;

    // Reset UI state
    resultsGrid.innerHTML = '';
    noResults.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    try {
      // Vercel Serverless Endpoint Call
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json();
      loadingSpinner.classList.add('hidden');

      // Serper returns shopping items in 'shopping' array
      const items = data.shopping || [];

      if (items.length === 0) {
        noResults.classList.remove('hidden');
        return;
      }

      // Render product cards
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all group";

        const imageUrl = item.imageUrl || 'https://via.placeholder.com/200?text=No+Image';
        const title = item.title || 'Product Alternative';
        const price = item.price || 'Check store';
        const source = item.source || 'Online Store';
        const link = item.link || '#';

        card.innerHTML = `
          <div>
            <div class="w-full h-48 bg-slate-900 rounded-xl overflow-hidden mb-4 flex items-center justify-center p-2">
              <img src="${imageUrl}" alt="${title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
            </div>
            <span class="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20 mb-2 inline-block">
              ${source}
            </span>
            <h3 class="text-sm font-semibold text-slate-100 line-clamp-2 mb-2 leading-snug">
              ${title}
            </h3>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <span class="text-lg font-bold text-emerald-400">${price}</span>
            <a href="${link}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-slate-700 hover:bg-purple-600 text-slate-100 text-xs font-medium rounded-lg transition-colors">
              View Deal →
            </a>
          </div>
        `;

        resultsGrid.appendChild(card);
      });

    } catch (err) {
      console.error('Search error:', err);
      loadingSpinner.classList.add('hidden');
      noResults.classList.remove('hidden');
    }
  });
});
