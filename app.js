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
        grid.innerHTML = '<p class="col-span-full text-center text-slate-500 py-12">No dupes found for that term. Try another item or brand!</p>';
        resultsSection.classList.remove('hidden');
        return;
    }

    const maxPrice = Math.max(...products.map(p => p.price));

    products.forEach((product) => {
        const discountPercentage = maxPrice > 0 ? Math.round(((maxPrice - product.price) / maxPrice) * 100) : 0;

        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between";

        card.innerHTML = `
            <div>
                <div class="relative bg-slate-100 aspect-square flex items-center justify-center overflow-hidden">
                    <img src="${product.image}" alt="${product.title}" class="object-contain h-full w-full p-4 hover:scale-105 transition duration-300" loading="lazy">
                    ${discountPercentage > 15 ? `<span class="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">${discountPercentage}% LESS</span>` : ''}
                </div>
                <div class="p-4">
                    <p class="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">${product.source}</p>
                    <h3 class="font-medium text-slate-900 text-sm line-clamp-2 mb-2" title="${product.title}">${product.title}</h3>
                </div>
            </div>
            <div class="p-4 pt-0 border-t border-slate-50 flex items-center justify-between mt-auto">
                <span class="text-lg font-bold text-slate-900">${product.rawPrice || '$' + product.price}</span>
                <a href="${product.link}" target="_blank" rel="noopener noreferrer" class="text-xs bg-slate-900 hover:bg-indigo-600 text-white font-semibold px-3 py-2 rounded-lg transition duration-200">
                    Shop Dupe ↗
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
