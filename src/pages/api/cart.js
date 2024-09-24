export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "https://d5b9de-6c.myshopify.com");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST");

  fetch("https://d5b9de-6c.myshopify.com/cart.js", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
  })
    .then((response) => response.json())
    .then((cart) => {
      console.log("cart.item_count", cart.item_count);
      res.json(cart);
    });
}
