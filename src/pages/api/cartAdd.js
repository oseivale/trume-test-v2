// pages/api/cartAdd.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://d5b9de-6c.myshopify.com"); // or "https://yourdomain.com"
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "POST") {
    const { variantId, imageUrl } = req.body;

    try {
      const shopifyResponse = await fetch(
        `https://d5b9de-6c.myshopify.com/cart/add.js`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': 'https://d5b9de-6c.myshopify.com',
          },
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

      const data = await shopifyResponse.json();
      //   res.send(data)
      //   console.log("data----", data);
      return res.status(200).json(data);
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
