async function searchDupes() {
  const searchInput = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('resultsContainer');
  const query = searchInput ? searchInput.value.trim() : '';

  if (!query) {
    alert('Please enter a brand or product name to search!');
    return;
  }

  // Show skeleton loader or loading state
  if (resultsContainer) {
    resultsContainer.innerHTML = '<p class="text-center text-gray-400 py-8">Scanning stores for the best dupes...</p>';
  }

  try {
    const response = await fetch(`/.netlify/functions/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    // If backend returned a specific error (e.g. SerpApi key issue)
    if (!response.ok || data.error) {
      console.error('Search API Error:', data.error || response.statusText);
      alert(`Search error: ${data.error || 'Unable to complete search'}`);
      if (resultsContainer) {
        resultsContainer.innerHTML = `<p class="text-center text-red-400 py-8">${data.error || 'Unable to fetch results right now.'}</p>`;
      }
      return;
    }

    const results = data.results || [];

    if (results.length === 0) {
      if (resultsContainer) {
        resultsContainer.innerHTML = '<p class="text-center text-gray-400 py-8">No dupes found for that term. Try another item or brand!</p>';
      }
      return;
    }

    // Render product cards
    renderResults(results);

  } catch (err) {
    console.error('Network Error:', err);
    alert('Unable to connect to the server. Please try again in a few seconds.');
  }
}

function renderResults(products) {
  const resultsContainer = document.getElementById('resultsContainer');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = products.map(product => `
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition-all">
      <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-contain rounded-lg mb-4 bg-white/5 p-2" />
      <div>
        <span class="text-xs text-purple-400 font-semibold uppercase">${product.source}</span>
        <h3 class="text-white font-medium text-sm line-clamp-2 mt-1 mb-2">${product.title}</h3>
      </div>
      <div class="mt-auto pt-3 flex items-center justify-between border-t border-slate-700/30">
        <span class="text-lg font-bold text-emerald-400">${product.formattedPrice}</span>
        <a href="${product.link}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors">
          View Deal ↗
        </a>
      </div>
    </div>
  `).join('');
}
