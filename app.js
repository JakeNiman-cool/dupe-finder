document.getElementById('searchForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    showLoading(true);

    try {
        const products = await fetchDupes(query);
        renderProducts(products);
    } catch (error) {
        alert("Unable to fetch results right now. Please try again in a few seconds.");
        console.error("Search Error:", error);
    } finally {
        showLoading(false);
    }
});

// Helper function to force external URLs to start with http:// or https://
function sanitizeUrl(url) {
    if (!url) return '#';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
}

// Calls your Netlify Serverless Backend Function
async function fetchDupes(query) {
    const endpoint = `/.netlify/functions/search?q=${encodeURIComponent(query)}`;

    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
        alert(`Notice: ${data.error}`);
        throw new Error(data.error);
    }

    const results = data.shopping_results || [];

    // Format and sort products from lowest price to highest
    return results.map(item => ({
        title: item.title,
        price: item.extracted_price || parseFloat(item.price?.replace(/[^0-9.]/g, '') || 0),
        rawPrice: item.price,
        source: item.source || 'Store',
        image: item.thumbnail || 'https://via.placeholder.com/200',
        link: sanitizeUrl(item.link || item.product_link)
    })).sort((a, b) => a.price - b.price);
}

// Renders product cards into the HTML grid
function renderProducts(products) {
    const grid = document.getElementById('resultsGrid');
    const resultsSection = document.getElementById('resultsSection');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-12 bg-slate-800/40 rounded-2xl border border-slate-800">No dupes found for that term. Try another item or brand!</p>';
        resultsSection.classList.remove('hidden');
        return;
    }

    products.forEach((product, index) => {
        const isBestDeal = index === 0; // First product is cheapest after sorting

        const card = document.createElement('div');
        card.className = "bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-4 hover:border-indigo-500/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group shadow-xl";

        card.innerHTML = `
            <div>
                <div class="relative bg-white rounded-xl aspect-square flex items-center justify-center overflow-hidden mb-4 p-4">
                    <img src="${product.image}" alt="${product.title}" class="object-contain h-full w-full group-hover:scale-110 transition duration-300" loading="lazy">
                    ${isBestDeal ? `<span class="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-lg">🔥 BEST VALUE</span>` : ''}
                </div>
                <div>
                    <p class="text-[11px] text-indigo-400 font-bold uppercase tracking-wider mb-1">${product.source}</p>
                    <h3 class="font-medium text-slate-100 text-sm line-clamp-2 mb-3 group-hover:text-white transition" title="${product.title}">${product.title}</h3>
                </div>
            </div>
            <div class="pt-3 border-t border-slate-700/60 flex items-center justify-between mt-auto">
                <span class="text-base font-extrabold text-white">${product.rawPrice || '$' + product.price}</span>
                <a href="${product.link}" target="_blank" rel="noopener noreferrer" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3.5 py-2 rounded-xl transition duration-200 shadow-md shadow-indigo-600/20 flex items-center gap-1">
                    <span>Shop</span>
                    <span class="text-indigo-200">↗</span>
                </a>
            </div>
        `;

        grid.appendChild(card);
    });

    resultsSection.classList.remove('hidden');
}

function showLoading(isLoading) {
    document.getElementById('loading').classList.toggle('hidden', !isLoading);
    if (isLoading) {
        document.getElementById('resultsSection').classList.add('hidden');
    }
}
