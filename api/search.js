export default async function handler(req, res) {
  try {
    const rawQuery = req.query.query || 'trending deals';
    const query = decodeURIComponent(rawQuery).toLowerCase().trim();
    const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);

    // Mock items dynamically built around the search term
    const mockItems = [
      {
        title: `Affordable Alternative / Dupe for ${capitalizedQuery}`,
        price: "£8.99",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}`,
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"
      },
      {
        title: `${capitalizedQuery} - Great Condition Thrift Find`,
        price: "£12.50",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(query)}`,
        thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
      },
      {
        title: `Vintage Style ${capitalizedQuery} Secondhand`,
        price: "£18.00",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}`,
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
      }
    ];

    return res.status(200).json({
      success: true,
      shopping: mockItems
    });
  } catch (error) {
    console.error("[Search API Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}
