export default async function addToCart(variantId, customLogoUrl) {
    const response = await fetch('https://d5b9de-6c.myshopify.com/api/2023-01/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: `
          mutation {
            checkoutCreate(input: {
              lineItems: [
                {
                  variantId: "${variantId}"
                  quantity: 1
                  customAttributes: [
                    {key: "Custom Logo", value: "${customLogoUrl}"}
                  ]
                }
              ]
            }) {
              checkout {
                id
                webUrl
              }
            }
          }
        `,
      }),
    });
  
    const data = await response.json();
    if (data.errors) {
      console.error(data.errors);
      return;
    }
    console.log('Checkout created:', data);
  };