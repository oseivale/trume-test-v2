// lib/shopify.js

export const addToCart = async (variantId, logoUrl) => {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id: variantId,
          quantity: 1,
          properties: {
            'Custom Logo': logoUrl,
          },
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Product added to cart:', data);
        return data;
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  