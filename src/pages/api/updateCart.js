export default async function fetchCheckout(checkoutId) {
    const query = `
      query($checkoutId: ID!) {
        node(id: $checkoutId) {
          ... on Checkout {
            id
            lineItems(first: 10) {
              edges {
                node {
                  id
                  title
                  quantity
                  variant {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
  
    const variables = { checkoutId };
  
    const response = await fetch('https://d5b9de-6c.myshopify.com/api/2024-04/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });
  
    const result = await response.json();
    return result.data.node;
  }