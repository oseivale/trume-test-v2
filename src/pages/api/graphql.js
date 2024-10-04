// pages/api/graphql.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    try {
      // Shopify GraphQL endpoint
      const shopifyEndpoint = 'https://d5b9de-6c.myshopify.com/api/2023-04/graphql.json';
  
      // Extract the mutation and variables from the request body
      const { query, variables } = req.body;
  
      // Make the request to Shopify Storefront API
      const shopifyResponse = await fetch(shopifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
        },
        body: JSON.stringify({
          query,
          variables
        })
      });
  
      // Parse the response from Shopify
      const data = await shopifyResponse.json();
  
      // Handle errors from Shopify's response
      if (!shopifyResponse.ok) {
        return res.status(shopifyResponse.status).json({ message: data.errors || 'Shopify API Error' });
      }
  
      // Send back the data from Shopify's response to the frontend
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error interacting with Shopify API:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }