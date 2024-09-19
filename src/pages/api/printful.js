export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { imageUrl, recipientDetails, productVariantId } = req.body;

  try {
    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        "X-PF-Store-Id": 14309939,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: recipientDetails,
        items: [
          {
            variant_id: productVariantId,  // Product variant ID from Printful
            quantity: 1,
            files: [
              {
                type: 'default',
                url: imageUrl,  // Cloudinary URL
              },
            ],
          },
        ],
        shipping: 'STANDARD',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Error from Printful:', data);
      return res.status(500).json({ message: data.error.message });
    }

    return res.status(200).json({ result: data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
