// api/search.js
export default async function handler(req, res) {
  try {
    const rawQuery = req.query.query || 'trending deals';
    const query = decodeURIComponent(rawQuery).toLowerCase().trim();
    
    // Capitalize for cleaner mock titles
    const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);

    // Mock shopping array matching the properties app.js expects:
    // (title, price, source, link, imageUrl/thumbnail)
    const mockShopping = [
      {
        title: `${capitalizedQuery} - Rare Vintage / Secondhand Deal`,
        price: "£14.99",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}`,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop"
      },
      {
        title: `Pre-owned ${capitalizedQuery} Condition 9/10`,
        price: "£18.50",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(query)}`,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop"
      },
      {
        title: `Affordable Alternative / Dupe for ${capitalizedQuery}`,
        price: "£22.00",
        source: "Depop",
        link: `https://www.depop.com/search/?q=${encodeURIComponent(query)}`,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop"
      },
      {
        title: `Authentic ${capitalizedQuery} Original Release`,
        price: "£85.00",
        source: "StockX", // Note: app.js filters this out due to excludedSources!
        link: `https://stockx.com/search?s=${encodeURIComponent(query)}`,
        imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&auto=format&fit=crop"
      }
    ];

    return res.status(200).json({
      success: true,
      shopping: mockShopping
    });

  } catch (error) {
    console.error("[Search API Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch search results"
    });
  }
}
