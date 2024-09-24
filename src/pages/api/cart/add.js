export default function handler(req, res) {
    // Set the CORS header to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Handle the preflight request for OPTIONS method
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.status(200).end();
      return;
    }
  
    // Handle the actual request
    if (req.method === 'POST') {
      // Your logic to add an item to the cart
      res.status(200).json({ message: 'Item added to cart' });
    } else {
      // If the request method is not POST, return a 405 Method Not Allowed
      res.setHeader('Allow', ['POST', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  