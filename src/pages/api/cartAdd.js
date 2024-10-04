// pages/api/cartAdd.js
import cookie from 'cookie';
const encodedCredentials = btoa(`${process.env.NEXT_PUBLIC_SHOPIFY_API_KEY}:${"Tr45#+luv"}`);

export default async function handler(req, res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "http://localhost:3000/"
  ); // or "https://yourdomain.com"
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "POST") {
    const { variantId, imageUrl } = req.body;
    const cookies = cookie.parse(req.headers.cookie || '');

    const shopifyCookies = Object.entries(cookies)
    .filter(([name]) => ['cart', 'cart_sig', 'cart_ts', 'secure_customer_sig'].includes(name))
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
 

    try {
       
      const shopifyResponse = await fetch(
        `https://d5b9de-6c.myshopify.com/cart/add.js`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:3000/",
            // 'Authorization': `Basic ${encodedCredentials}`,
            'Access-Control-Allow-Credentials': true,
            'Cookie': `_shopify_s=${cookies._shopify_s}; _shopify_y=${cookies._shopify_y};`
          },
          credentials: "include",
          body: JSON.stringify({
            // id: '44618893918385',
            id: variantId,
            quantity: 1,
            properties: {
              "Custom Image": imageUrl,
              // imageUrl: 'https://res.cloudinary.com/dnoiiw1jg/image/upload/v1726802965/ruwkh5yg1xldxpgvlsvw.png' //
            },
          }),
        }
      );

      if (!shopifyResponse.ok) {
        return res
          .status(shopifyResponse.status)
          .json({ message: "Error adding to cart" });
      }
      console.log('shopifyCookies', shopifyCookies)

      const data = await shopifyResponse.json();
      //   res.send(data)
        console.log("data----", data);
    //   return res.status(200).json(data);
      res.status(200).json({ message: 'Cookies parsed successfully', cookies, data });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// export default async function handler(req, res) {
//     if (req.method === "POST") {
//       const { variantId, imageUrl } = req.body;

//       try {
//         // Step 1: Add item to Shopify cart
//         const shopifyResponse = await fetch(
//           `https://d5b9de-6c.myshopify.com/cart/add.js`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               id: variantId,
//               quantity: 1,
//               properties: {
//                 "Custom Image": imageUrl,
//               },
//             }),
//           }
//         );

//         if (!shopifyResponse.ok) {
//           return res
//             .status(shopifyResponse.status)
//             .json({ message: "Error adding to cart" });
//         }

//         const data = await shopifyResponse.json();

//         // Step 2: Fetch the updated cart to ensure the UI reflects the change
//         const cartResponse = await fetch(`https://d5b9de-6c.myshopify.com/cart.js`);

//         if (!cartResponse.ok) {
//           return res
//             .status(cartResponse.status)
//             .json({ message: "Error fetching updated cart" });
//         }

//         const cartData = await cartResponse.json();

//         // Step 3: Return the updated cart data
//         return res.status(200).json(cartData);

//       } catch (error) {
//         return res
//           .status(500)
//           .json({ message: "Internal Server Error", error: error.message });
//       }
//     } else {
//       return res.status(405).json({ message: "Method Not Allowed" });
//     }
//   }
