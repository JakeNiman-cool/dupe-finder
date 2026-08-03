export default async function handler(req, res) {
  try {
    const query = req.query.query || 'trending deals';
    console.log(`[Vercel Search API] Processing search query: "${query}"`);

    // Mock/Fallback results structured for budget marketplaces (eBay, Vinted)
    const mockShoppingResults = [
      {
        title: `${query} - Great Condition Thrift Find`,
        price: "£12.50",
        source: "Vinted",
        link: "https://www.vinted.co.uk",
        thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
      },
      {
        title: `Vintage Style ${query} Secondhand`,
        price: "£18.00",
        source: "eBay",
        link: "https://www.ebay.co.uk",
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
      },
      {
        title: `Affordable Alternative / Dupe for ${query}`,
        price: "£8.99",
        source: "eBay",
        link: "https://www.ebay.co.uk",
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"
      }
    ];

    return res.status(200).json({
      success: true,
      shopping: mockShoppingResults
    });
  } catch (error) {
    console.error("[Vercel Search API Error]:", error);
    return res.status(200).json({
      success: false,
      shopping: []
    });
  }
}
