// export default async function handler(req, res) {
//   res.setHeader(
//     "Access-Control-Allow-Origin",
//     "https://d5b9de-6c.myshopify.com"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST");

//   fetch("https://d5b9de-6c.myshopify.com/cart.js", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   })
//     .then((response) => response.json())
//     .then((cart) => {
//       console.log("cart.item_count", cart);
//       res.status(200).json(cart);
//     });
// }

// /pages/api/cart.js

export default async function handler(req, res) {
    if (req.method === "GET") {
      try {
        const response = await fetch("https://d5b9de-6c.myshopify.com/cart.js", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add any required headers, such as credentials if needed
          },
          credentials: "include", // Ensure credentials are included
        });
  
        if (!response.ok) {
          return res.status(response.status).json({ error: "Failed to fetch cart" });
        }
  
        const cartData = await response.json();
        return res.status(200).json(cartData);
  
      } catch (error) {
        console.error("Error fetching cart:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  }