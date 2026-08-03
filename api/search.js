export default async function handler(req, res) {
  try {
    const rawQuery = req.query.query || 'trending deals';
    const query = decodeURIComponent(rawQuery).toLowerCase().trim();
    const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);

    // Dynamic image selection based on search context so images are never random
    let thumb = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";
    if (query.includes('dunk') || query.includes('shoe') || query.includes('sneaker') || query.includes('nike')) {
      thumb = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300";
    } else if (query.includes('watch') || query.includes('clock')) {
      thumb = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";
    } else if (query.includes('headphone') || query.includes('audio')) {
      thumb = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300";
    }

    const items = [
      {
        title: `Cheap ${capitalizedQuery} - Budget Find`,
        price: "£12.99",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(query)}`,
        thumbnail: thumb
      },
      {
        title: `Secondhand ${capitalizedQuery} Tested`,
        price: "£18.50",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=15`,
        thumbnail: thumb
      },
      {
        title: `Aesthetic Style Alternative / Dupe of ${capitalizedQuery}`,
        price: "£8.99",
        source: "Depop",
        link: `https://www.depop.com/search/?q=${encodeURIComponent(query)}`,
        thumbnail: thumb
      },
      {
        title: `Pre-loved ${capitalizedQuery} Bargain`,
        price: "£14.00",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(query)}`,
        thumbnail: thumb
      },
      {
        title: `Authentic Style ${capitalizedQuery}`,
        price: "£24.99",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=15`,
        thumbnail: thumb
      },
      {
        title: `Affordable ${capitalizedQuery} Model`,
        price: "£19.00",
        source: "Amazon",
        link: `https://www.amazon.co.uk/s?k=${encodeURIComponent(query)}`,
        thumbnail: thumb
      }
    ];

    return res.status(200).json({
      success: true,
      shopping: items
    });
  } catch (error) {
    console.error("[Search API Error]:", error);
    return res.status(200).json({ success: false, shopping: [] });
  }
}
