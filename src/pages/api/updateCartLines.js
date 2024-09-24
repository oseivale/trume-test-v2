export default function handler(req, res) {
  fetch("https://d5b9de-6c.myshopify.com/cart.js")
    .then((response) => response.json())
    .then((cart) => {
        console.log('cart.item_count', cart.item_count)
        res.send(cart)
  
    });
}
