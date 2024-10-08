// File: pages/api/webhooks/order-created.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const orderData = req.body;

    // Extract necessary details from the order
    const orderId = orderData.id;
    const customerEmail = orderData.email;
    const items = orderData.line_items;
    const customAttributes = items.map(item => item.properties);  // Custom attributes like image URL

    // Process the order with Printful API
    const printfulApiUrl = 'https://api.printful.com/orders';
    
    try {
      const response = await axios.post(printfulApiUrl, {
        recipient: {
          name: orderData.shipping_address.name,
          address1: orderData.shipping_address.address1,
          city: orderData.shipping_address.city,
          country_code: orderData.shipping_address.country_code,
          zip: orderData.shipping_address.zip,
        },
        items: items.map(item => ({
          variant_id: item.variant_id,  // Replace with Printful's variant_id
          quantity: item.quantity,
          files: [{
            url: customAttributes.['Logo Preview'],  // Assuming image URL is passed in the properties
          }],
        })),
      }, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PRINTFUL_API_KEY}`
        }
      });

      res.status(200).json({ message: 'Order processed successfully!' });
    } catch (error) {
      console.error('Error processing order with Printful:', error);
      res.status(500).json({ error: 'Error processing order' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}