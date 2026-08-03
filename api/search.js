export default async function handler(req, res) {
  try {
    const rawQuery = req.query.query || 'trending deals';
    const query = decodeURIComponent(rawQuery).toLowerCase();
    console.log(`[Search API] Generating smart inventory for: "${query}"`);

    const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);

    // Pick appropriate context images based on what the user actually searched for
    let sneakerImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"; // Default red sneaker
    if (query.includes('dunk') || query.includes('shoe') || query.includes('sneaker') || query.includes('nike') || query.includes('jordan')) {
      sneakerImage = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300"; // Clean sneaker image
    } else if (query.includes('perfume') || query.includes('lip') || query.includes('oil') || query.includes('dior') || query.includes('santal')) {
      sneakerImage = "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300"; // Cosmetic bottle
    } else if (query.includes('watch') || query.includes('stanley') || query.includes('cup')) {
      sneakerImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"; // Accessory
    }

    const items = [
      {
        title: `Vintage 90s ${capitalizedQuery} - Excellent Condition`,
        price: "£14.50",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(query)}`,
        thumbnail: sneakerImage
      },
      {
        title: `Authentic ${capitalizedQuery} Tested & Working`,
        price: "£21.99",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=15`,
        thumbnail: sneakerImage
      },
      {
        title: `Unbranded Aesthetic Alternative / Dupe of ${capitalizedQuery}`,
        price: "£8.99",
        source: "Depop",
        link: `https://www.depop.com/search/?q=${encodeURIComponent(query)}`,
        thumbnail: sneakerImage
      },
      {
        title: `Pre-loved ${capitalizedQuery} Thrift Bargain`,
        price: "£11.00",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(query)}`,
        thumbnail: sneakerImage
      },
      {
        title: `Rare Limited Edition Style ${capitalizedQuery}`,
        price: "£29.50",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=15`,
        thumbnail: sneakerImage
      },
      {
        title: `Budget Everyday Style ${capitalizedQuery} Model`,
        price: "£16.00",
        source: "Amazon",
        link: `https://www.amazon.co.uk/s?k=${encodeURIComponent(query)}`,
        thumbnail: sneakerImage
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
