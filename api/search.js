export default async function handler(req, res) {
  try {
    const rawQuery = req.query.query || 'trending deals';
    const query = decodeURIComponent(rawQuery).toLowerCase();
    console.log(`[Search API] Generating product inventory for: "${query}"`);

    // Generate diverse, individual product listings based on what was searched
    const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);
    
    const items = [
      {
        title: `Vintage 90s ${capitalizedQuery} - Excellent Condition`,
        price: "£14.50",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(query)}`,
        thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
      },
      {
        title: `Authentic ${capitalizedQuery} Tested & Working`,
        price: "£21.99",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=15`,
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
      },
      {
        title: `Unbranded Aesthetic Alternative / Dupe of ${capitalizedQuery}`,
        price: "£8.99",
        source: "Depop",
        link: `https://www.depop.com/search/?q=${encodeURIComponent(query)}`,
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"
      },
      {
        title: `Pre-loved ${capitalizedQuery} Thrift Bargain`,
        price: "£11.00",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(query)}`,
        thumbnail: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300"
      },
      {
        title: `Rare Limited Edition Style ${capitalizedQuery}`,
        price: "£29.50",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=15`,
        thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300"
      },
      {
        title: `Budget Everyday Style ${capitalizedQuery} Model`,
        price: "£16.00",
        source: "Amazon",
        link: `https://www.amazon.co.uk/s?k=${encodeURIComponent(query)}`,
        thumbnail: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300"
      }
    ];

    return res.status(200).json({
      success: true,
      shopping: items
    });
  } catch (error) {
    console.error("[Search API Error]:", error);
    return res.status(200).json({
      success: false,
      shopping: []
    });
  }
}
