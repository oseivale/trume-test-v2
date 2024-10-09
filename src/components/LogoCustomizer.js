import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { uploadImageToCloudinary } from "../lib/cloudinary";
import { data, classic, bright, spark } from "../data";
import styles from "./styles.module.css";
import { toPng, toJpeg } from "html-to-image";
import { roboto_condensed } from "@/fonts";
import { useRouter } from "next/router";
import { variantMapping } from "../../productVariants";
import Image from "next/image";
import Client from "shopify-buy";
import "../app/globals.css";
import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import Dropdown from "./Dropdown";

const ClearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1.5em"
    height="1.5em"
    viewBox="0 0 24 24"
    style={{ marginLeft: ".5rem" }}
  >
    <path
      fill="#120D96"
      d="M12 6v3l4-4l-4-4v3a8 8 0 0 0-8 8c0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.9 5.9 0 0 1 6 12a6 6 0 0 1 6-6m6.76 1.74L17.3 9.2c.44.84.7 1.8.7 2.8a6 6 0 0 1-6 6v-3l-4 4l4 4v-3a8 8 0 0 0 8-8c0-1.57-.46-3.03-1.24-4.26"
    ></path>
  </svg>
);

export default function LogoCustomizer() {
  const router = useRouter();
  const { productId, variantId, productTitle, image, tags } = router.query;

  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");

  console.log("productId", productId);
  console.log("variantId", variantId);
  console.log("productTag", tags);

  //  References and States
  const logoRef = useRef(null);
  const [imageData, setImageData] = useState("");
  const [status, setStatus] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ffffff"); // To store the selected color

  const [selectedValues, setSelectedValues] = useState([]);
  const [singleColorMode, setSingleColorMode] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(null); // To store the selected palette
  // const [color, setColor] = useState("#ffffff");
  const [isPickerActive, setPickerActive] = useState(false); // controls whether the color picker is active
  const [variantIdState, setVariantIdState] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [product, setProduct] = useState({});
  // const [logoUrl, setLogoUrl] = useState("");
  // Custom order for mapping selected values to bars
  const [checkoutId, setCheckoutId] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [quantity, setQuantity] = useState(1); // Set the initial quantity to 1
  const [coreValues, setCoreValues] = useState({});
  let list = [];

  useEffect(() => {
    if (tags) {
      const tagArray = tags.split(" "); // Split the tags by spaces into an array
      const availableOptions = [];

      if (tags.includes("bright")) {
        availableOptions.push({ value: "bright", label: "Bright" });
      }
      if (tags.includes("spark")) {
        availableOptions.push({ value: "spark", label: "Spark" });
      }
      if (tags.includes("classic")) {
        availableOptions.push({ value: "classic", label: "Classic" });
      }

      setDropdownOptions(availableOptions); // Set options dynamically
    }
  }, [tags]);

  console.log("dropdownOptions", dropdownOptions);

  // Handle option change
  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);

    if (event.target.value === "classic") {
      setCoreValues(classic);
    }

    if (event.target.value === "spark") {
      setCoreValues(spark);
    }

    if (event.target.value === "bright") {
      setCoreValues(bright);
    }
  };

  console.log("coreValues", selectedOption === "bright");

  // Predefined colors for the user to choose from
  const colorOptions = ["#FF5733", "#33FF57", "#3357FF", "#FFD700", "#FF33A8"];

  // Color palettes for the user to choose from
  const palettes = {
    blue: ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087"],
    green: ["#006400", "#228B22", "#32CD32", "#7CFC00", "#ADFF2F"],
    red: ["#8B0000", "#B22222", "#DC143C", "#FF4500", "#FF6347"],
  };

  const customBarOrder = [2, 0, 1, 4, 3];

  const handleButtonClick = (key) => {
    if (selectedValues.includes(key)) {
      // Deselect the value if it is already selected
      setSelectedValues(selectedValues.filter((item) => item !== key));
    } else if (selectedValues.length < 5) {
      // Select the value if less than 5 are selected
      setSelectedValues([...selectedValues, key]);
    }
  };

  const handleClearAll = () => {
    setSelectedValues([]);
    //setSelectedColor(null); // Clear the selected color
    setSingleColorMode(false); // Turn off single color mode
    setSelectedPalette(null);
    setPickerActive(false);
  };

  const handleToggleSingleColor = () => {
    setSingleColorMode(!singleColorMode);
    if (!singleColorMode) {
      //setSelectedColor(null); // Deselect the preset color if Single Color Mode is activated
      setSelectedPalette(null);
      setPickerActive(false);
    }
  };
  const handleColorSelection = (color) => {
    if (selectedColor === color) {
      setSelectedColor(null); // Deselect the color
    } else {
      //setSelectedColor(color);
      setSingleColorMode(false); // Turn off single color mode
      setSelectedPalette(null);
    }
  };

  const handlePaletteSelection = (palette) => {
    if (selectedPalette === palette) {
      setSelectedPalette(null); // Deselect the palette
    } else {
      setSelectedPalette(palette);
      setSingleColorMode(false); // Turn off single color mode
      //setSelectedColor(null); // Deselect any custom color
      setPickerActive(false);
    }
  };

  const uploadImageToCloudinary = async (imageData) => {
    const formData = new FormData();
    formData.append("file", imageData); // The image data (base64 format from html2canvas)
    formData.append("upload_preset", "trume-test"); // Unsigned upload preset created in Cloudinary dashboard

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        console.log("Image uploaded to Cloudinary:", data.secure_url);
        return data.secure_url; // Return the URL for further use
      } else {
        console.error("Error uploading image:", data);
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleDownloadImage = () => {
    if (logoRef.current) {
      // Get the dimensions of the logo element
      const { width, height, top, left } =
        logoRef.current.getBoundingClientRect();

      setTimeout(() => {
        toPng(logoRef.current, {
          cacheBust: true,
          width: Math.ceil(width), // Explicitly set the width
          height: Math.ceil(height), // Explicitly set the height
          style: {
            transform: "none", // Disable any transforms for the capture
            position: "static", // Temporarily reset the position for capture
            top: 0, // Align to top
            left: 0, // Align to left
            width: `${Math.ceil(width)}px`, // Ensure width is correct
            height: `${Math.ceil(height)}px`, // Ensure height is correct
          },
        })
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = "custom-logo.png";
            link.href = dataUrl;
            console.log("link: ", dataUrl);
            link.click();
          })
          .catch((err) => {
            console.error("Failed to export image", err);
          });
      }, 100); // Adjust the timeout as needed
    }
  };

  // Printful product variant ID
  const productVariantId = variantMapping[variantId];
  const handleVariantSelection = (id) => {
    setVariantIdState(id); // Assuming `id` is the Shopify product variant ID
  };

  const generateImage = async () => {
    if (logoRef.current) {
      // Get the dimensions of the logo element
      const { width, height, top, left } =
        logoRef.current.getBoundingClientRect();

      await toPng(logoRef.current, {
        cacheBust: true,
        width: Math.ceil(width), // Explicitly set the width
        height: Math.ceil(height), // Explicitly set the height
        style: {
          transform: "none", // Disable any transforms for the capture
          position: "static", // Temporarily reset the position for capture
          top: 0, // Align to top
          left: 0, // Align to left
          width: `${Math.ceil(width)}px`, // Ensure width is correct
          height: `${Math.ceil(height)}px`, // Ensure height is correct
        },
      })
        .then((dataUrl) => {
          console.log("image data updated!!");

          uploadImageToCloudinary(dataUrl).then((cloudinaryImg) => {
            setImageData(cloudinaryImg);
            handleVariantSelection(variantId);
          });
        })
        .catch((err) => {
          console.error("Failed to export image", err);
        });
    }
  };

  const handlePlaceOrder = async () => {
    setStatus("Generating image...");
    console.log("imageData", imageData);

    if (!imageData) {
      setStatus("Error generating image.");
      return;
    }

    setStatus("Uploading image to Cloudinary...");
    const cloudinaryUrl = await uploadImageToCloudinary(imageData);

    if (!cloudinaryUrl) {
      setStatus("Error uploading image to Cloudinary.");
      return;
    }

    // Printful product variant ID
    const productVariantId = variantMapping[variantId];
    // const handleVariantSelection = (id) => {
    //   setVariantIdState(id); // Assuming `id` is the Shopify product variant ID
    // };
    console.log("productVariantId from customizer", productVariantId);

    setStatus("Sending order to Printful...");
    const recipientDetails = {
      name: "Valerie Osei",
      address1: "12 address avenue, Bankstown",
      city: "Sydney",
      state_code: "NSW",
      country_code: "AU",
      zip: "2200",
      items: [
        {
          variant_id: productVariantId,
          quantity: 1,
          files: [
            {
              url: "http://example.com/files/posters/poster_1.jpg",
            },
          ],
        },
      ],
    };

    const response = await fetch("/api/printful", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: cloudinaryUrl,
        recipientDetails,
        productVariantId,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      setStatus("Order placed successfully!");
      setImageData("");
    } else {
      setStatus(`Error placing order: ${result.message}`);
    }
  };

  const incrementQuantity = (e) => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decrementQuantity = (e) => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const handleColorChange = (event) => {
    if (isPickerActive) {
      setSelectedColor(event.target.value);
      // setPickerActive(!isPickerActive);
      // setPickerActive(true)
    } else {
      setSelectedPalette(null);
      setSingleColorMode(false); // Turn off single color mode
      setSelectedColor(null);
    }
  };

  const toggleColorPicker = () => {
    setPickerActive(!isPickerActive);
    setSelectedPalette(null);
    setSingleColorMode(false); // Turn off single color mode
    // setSelectedColor(null);
  };

  // Function to calculate the luminance of a hex color
  function getLuminance(hexColor) {
    const rgb = hexToRgb(hexColor);
    const a = rgb.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  // Function to convert hex to RGB
  function hexToRgb(hex) {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return [r, g, b];
  }

  // Function to darken a color by a certain percentage
  function darkenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    const darkerRgb = rgb.map((v) => Math.max(0, v - (v * percent) / 100));
    return `rgb(${darkerRgb.join(",")})`;
  }

  // Function to determine the appropriate text color
  function getTextColor(bgColor) {
    const luminance = getLuminance(bgColor);
    // If the background is light, use white text
    if (luminance > 0.5) {
      return darkenColor(bgColor, 50);
    } else {
      // If the background is dark, use a darker shade of the background color
      return "#FFFFFF";
    }
  }

  const textColor = getTextColor(selectedColor);

  const shopifyClient = Client.buildClient({
    domain: "d5b9de-6c.myshopify.com",
    storefrontAccessToken:
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  });

  // Function to add product with custom logo to cart
  const addProductWithCustomLogo = async (variantId, imageUrl) => {
    try {
      // Get the current checkout or create a new one
      const globalVariantId = btoa(`gid://shopify/ProductVariant/${variantId}`);

      let checkoutId = localStorage.getItem("checkoutId");
      if (!checkoutId) {
        const checkout = await shopifyClient.checkout.create();
        checkoutId = checkout.id;
        localStorage.setItem("checkoutId", checkoutId);
      }

      // Prepare the line item with custom properties
      const lineItemsToAdd = [
        {
          variantId, // Shopify variant ID
          quantity: 1,
          customAttributes: [
            {
              key: "Custom Image",
              value: imageUrl, // URL of the custom logo
            },
          ],
        },
      ];

      // Add the line item to the checkout
      const checkout = await shopifyClient.checkout.addLineItems(
        checkoutId,
        lineItemsToAdd
      );

      // Log the updated checkout information
      console.log("Checkout:", checkout);

      // Update the cart UI
      // await updateCartUI();

      return checkout;
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  // const addProductWithCustomLogo = async (variantId, customImageUrl) => {
  //   try {
  //     const globalVariantId = btoa(`gid://shopify/ProductVariant/${variantId}`);

  //     const response = await fetch("/api/add", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         variantId: globalVariantId,
  //         quantity: 1,
  //         customAttributes: [
  //           {
  //             key: "Custom Image",
  //             value: customImageUrl,
  //           },
  //         ],
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to add product to cart");
  //     }

  //     const data = await response.json();
  //     console.log("Product added to cart", data);

  //     // Update the cart UI
  //     await updateCartUI();

  //   } catch (error) {
  //     console.error("Error adding product to cart:", error);
  //   }
  // };

  // Function to open the cart drawer
  // const openCartDrawer = () => {
  //   const cartDrawerButton = document.querySelector('[href="#cart-side-drawer"]');
  //   if (cartDrawerButton) {
  //     cartDrawerButton.click();
  //   } else {
  //     console.error('Cart drawer button not found');
  //   }
  // };

  // const addToCart = async (variantId, customLogoUrl) => {
  //   try {
  //     const response = await fetch('/api/addToCart', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ variantId, customLogoUrl }),
  //     });

  //     if (!response.ok) {
  //       console.error('Failed to add to cart:', response.statusText);
  //       return;
  //     }

  //     const data = await response.json();
  //     console.log('Item added to cart:', data);

  //     // Optionally, trigger the cart drawer to open here
  //     openCartDrawer();

  //   } catch (error) {
  //     console.error('Error adding to cart:', error);
  //   }
  // };

  const processCheckout = async () => {
    const response = await fetch("/cart.js");
    const cart = await response.json();

    const orderData = {
      recipient: {
        name: "Customer Name", // Replace with real data
        address1: "Customer Address", // Replace with real data
        city: "City", // Replace with real data
        // Other necessary fields
      },
      items: cart.items.map((item) => ({
        sync_variant_id: item.variant_id,
        quantity: item.quantity,
        files: [{ url: item.properties["Custom Logo"] }],
      })),
      // Other necessary fields
    };

    const printfulResponse = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!printfulResponse.ok) {
      console.error(
        "Failed to send order to Printful:",
        printfulResponse.statusText
      );
    } else {
      const result = await printfulResponse.json();
      console.log("Order sent to Printful:", result);
    }
  };

  // Function to refresh the cart drawer contents
  const refreshCartDrawer = async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        console.error("Error refreshing cart drawer:", response.statusText);
        return;
      }

      const cartData = await response.json();
      console.log("cart-----", cartData);
      // updateCartUI(cartData); // Function to update the cart drawer with new data
    } catch (error) {
      console.error(
        "An error occurred while refreshing the cart drawer:",
        error
      );
    }
  };

  const fetchCheckout = async (checkoutId) => {
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
                    customAttributes {
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        }
      `;

    const variables = { checkoutId };

    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add your API credentials or token here
        "X-Shopify-Storefront-Access-Token":
          process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    // Return the checkout data
    console.log("--fetch checkout--", data.data.node);
    return data.data.node;
  };
  async function updateCart() {
    const response = await fetch("/cart.js");
    const cartData = await response.json();
    console.log("updating the cart", cartData); // Check what the cart looks like
    // updateCartUI(cartData);
  }

  const addProductToCart = async (
    checkoutId,
    customAttributes,
    variantId,
    quantity
  ) => {
    // Create a new checkout if checkoutId doesn't exist
    console.log("--checkoutId--", checkoutId);
    console.log("--variantId--", variantId);
    console.log("--customAttributes--", customAttributes);
    console.log("--quantity--", quantity);

    if (!checkoutId) {
      await createCheckout();
    }

    const mutation = `
        mutation checkoutLineItemsAdd($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
          checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
            checkout {
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
                    customAttributes {
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        }
      `;

    const encodeShopifyId = (type, id) => {
      return btoa(`gid://shopify/${type}/${id}`);
    };

    console.log("---mutation---", mutation);
    // Convert your variantId and checkoutId
    const globalVariantId = encodeShopifyId(
      "ProductVariant",
      variantId
    ).toString();
    const globalCheckoutId = encodeShopifyId("Checkout", checkoutId);

    console.log("--globalVariantId--", globalVariantId);
    console.log("--globalCheckoutId--", globalCheckoutId);

    // Example: Convert variantId to global ID
    // const globalVariantId = encodeShopifyId('ProductVariant', variantId);

    const variables = {
      checkoutId,
      lineItems: [
        {
          variantId: globalVariantId,
          quantity: parseInt(quantity),
          customAttributes,
        },
      ],
    };

    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add your API credentials or token here
        "X-Shopify-Storefront-Access-Token":
          process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const data = await response.json();
    console.log("hello data", data);
    // Optionally update the checkout state
    // const newCheckout = data?.data?.checkoutLineItemsAdd?.checkout;
    // setCheckoutId(newCheckout?.id);
    // setLineItems(newCheckout?.lineItems?.edges?.map(edge => edge?.node));
    // Ensure you have valid data and update the lineItems state
    if (data && data.data && data.data.checkoutLineItemsAdd) {
      const updatedCheckout = data.data.checkoutLineItemsAdd.checkout;
      const updatedLineItems = updatedCheckout.lineItems.edges.map(
        (edge) => edge.node
      );

      // Update your state
      setLineItems(updatedLineItems);
      setCheckoutId(updatedCheckout.id);
    }

    const encodedVariantId = encodeShopifyId("ProductVariant", variantId);
    const sendMessage = () => {
      const data = {
        message: "add-to-cart",
        payload: {
          // variantId:`gid://shopify/ProductVariant/${variantId}`,
          quantity: parseInt(quantity),
          variantId: variantId.toString(),
          customAttributes: [{ key: "Logo Preview", value: imageData }],
        },
      };

      // Sending the message to the parent window (Shopify Store)
      window.parent.postMessage(data, "*");
    };

    // Trigger the function when needed
    sendMessage();

    // Trigger cart drawer to open
    // openCartDrawer();
    // const updatedCart = await updateCart();
    // const updatedCartReponse = updatedCart.json()

    // console.log('updatedCartReponse', updatedCartReponse)
  };

  // Function to create a new checkout if there's no checkoutId
  const createCheckout = async () => {
    const query = `
      mutation {
        checkoutCreate(input: {}) {
          checkout {
            id
          }
        }
      }
    `;

    const response = await fetch(
      "https://d5b9de-6c.myshopify.com/api/2023-04/graphql.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token":
            process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
          // Add your API credentials or token here
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();
    console.log("--data--", data);
    const newCheckoutId = data.data.checkoutCreate.checkout.id;
    console.log("--newCheckoutId--", newCheckoutId);
    setCheckoutId(newCheckoutId);
  };

  useEffect(() => {
    if (productTitle && variantId && tags) {
      console.log("Product Title:", productTitle);
      console.log("Variant ID:", variantId);
      // getCoreValues()
    }
  }, [productTitle, variantId, tags]);

  // Load the checkout or create one when the component mounts
  useEffect(() => {
    if (!checkoutId) {
      createCheckout();
    }
  }, [checkoutId]);
  console.log("checkoutId updated!!", checkoutId);

  async function updateCartFromCheckout(checkoutId) {
    const checkoutData = await fetchCheckout(checkoutId);

    console.log("---checkoutData from update cart--", checkoutData);

    if (checkoutData && checkoutData.lineItems) {
      // Clear existing cart lines
      const cartContainer = document.querySelector(".cart-items");
      if (cartContainer) {
        cartContainer.innerHTML = "";

        // Add new cart lines
        checkoutData.lineItems.edges.forEach(({ node }) => {
          const cartItem = document.createElement("div");
          cartItem.className = "cart-item";

          cartItem.innerHTML = `
            <div class="cart-item-title">${node.title}</div>
            <div class="cart-item-quantity">Quantity: ${node.quantity}</div>
            <div class="cart-item-price">${node.variant.priceV2.amount} ${node.variant.priceV2.currencyCode}</div>
          `;

          cartContainer.appendChild(cartItem);
        });

        // Update cart count
        const cartCount = document.querySelector(".cart-count");
        if (cartCount) {
          cartCount.textContent = checkoutData.lineItems.edges.length;
        }
      }
    }
  }

  useEffect(() => {
    if (checkoutId) {
      console.log("--updated from useEffect!!---");
      updateCartFromCheckout(checkoutId); // Update the cart UI
    }
  }, [checkoutId]);

  console.log("coreValues---", coreValues);

  return (
    <div
      className={`${styles.customizationContainer}${roboto_condensed.className}`}
    >
      <h1
        className={roboto_condensed.className}
        style={{
          width: "90%",
          margin: "2rem auto",
          fontSize: "40px",
          fontWeight: "800",
        }}
      >
        Customize Your Logo
      </h1>
      <div style={{ width: "90%", margin: "0rem auto 3rem" }}>
        {/* <h2>Core Value Options</h2> */}
        <div className={styles.coreValueSelectionDescription}>
          <p className={roboto_condensed.className}>
            Select any 5 of the core value options below. Your core values will
            show up in the logo template below for you to preview.{" "}
          </p>
          <p className={roboto_condensed.className}>
            Core value selection order starts with the first selected option
            being the tallest bar, progressing to the 5th selected option being
            the shortest bar.
          </p>
          <p
            className={roboto_condensed.className}
            style={{ fontWeight: "800" }}
          >
            Set your mode from the dropdown below, then scroll the core values from right to left, to view all the core value
            options.
          </p>

           {/* <Dropdown tags={tags} /> */}
        {/* <div className="dropdown-container">
          <label htmlFor="dynamic-dropdown" className={"dropdown-label"}>
            Select an Option
          </label>
          <select
            id="dynamic-dropdown"
            className="dropdown"
            value={selectedOption}
            onChange={handleSelectChange}
          >
            <option value="" disabled>
              -- Choose an option --
            </option>
            {dropdownOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedOption && (
            <div className="selected-option">
              <p>You selected: {selectedOption}</p>
            </div>
          )}
        </div> */}
        <div className={styles.dropdownContainer}>
          <label htmlFor="dynamicDropdown" className={`${roboto_condensed.className} ${styles.dropdownLabel}`}>
          Choose Your Mode
          </label>
          <select
            id="dynamicDropdown"
            className={styles.dropdown}
            value={selectedOption}
            onChange={handleSelectChange}
          >
            <option value="" disabled className={roboto_condensed.className}>
              -- Choose an option --
            </option>
            {dropdownOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedOption && (
            <div className={`${roboto_condensed.className} ${styles.selectedOption}`}>
             {/* <span>Selected Theme: </span> <p>{selectedOption}</p> */}
            </div>
          )}
        </div>
        </div>
       
        <div className={styles.coreValueWrapper}>
          {Object.keys(coreValues).map((key) => {
            const isSelected = selectedValues.includes(key);
            const selectedIndex = selectedValues.indexOf(key);

            return (
              <button
                key={key}
                onClick={() => handleButtonClick(key)}
                className={
                  selectedValues.length < 5 && !isSelected
                    ? styles.valueBtn
                    : ""
                }
                style={{
                  backgroundColor: isSelected
                    ? coreValues[key].colourHex
                    : "#D4D4D4",
                  color: "#fff",
                  width: "115px",
                  padding: "15px",
                  margin: "5px",
                  border: "none",
                  borderRadius: "5px",
                  cursor:
                    selectedValues.length >= 5 && !isSelected
                      ? "not-allowed"
                      : "pointer",
                  position: "relative",
                }}
                disabled={selectedValues.length >= 5 && !isSelected}
              >
                {isSelected && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "-10px",
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                    }}
                  >
                    {selectedIndex + 1}
                  </span>
                )}
                <span
                  className={`${roboto_condensed.className} ${styles.shortCode}`}
                >
                  {coreValues[key].shortCode}
                </span>
                <span
                  className={`${roboto_condensed.className} ${styles.name}`}
                >
                  {coreValues[key].name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className={`${styles.customization}`} style={{ width: "90%" }}>
        <div className={styles.confirmOptions}>
          {/* Custom Color Settings Start  */}
          {/* <h2>Additional Customization Options</h2> */}
          <div className={styles.customColours}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div className={styles.singleColorMode}>
                <label
                  className={`${roboto_condensed.className} ${styles.switchLabel}`}
                >
                  Single Color Mode:
                </label>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={singleColorMode}
                    onChange={handleToggleSingleColor}
                  />

                  <span className={styles.slider}></span>
                </label>
                <p className={roboto_condensed.className}>
                  Selecting single colour mode will change all the bars to the
                  colour of your first selected core value.
                </p>
              </div>
            </div>
            <div
              className={styles.customColor}
              style={{ marginBottom: "20px" }}
            >
              <div>
                <div
                  className={`${styles.colorPickerCheckBox} ${roboto_condensed.className}`}
                >
                  <label htmlFor="togglePicker">
                    Enable Color Picker
                    <input
                      type="checkbox"
                      id={styles.togglePicker}
                      name="togglePicker"
                      checked={isPickerActive}
                      onChange={toggleColorPicker}
                    />
                  </label>
                  <div
                    className={
                      isPickerActive ? styles.expand : styles.collapsibleContent
                    }
                  >
                    <p>
                      Checking this box will activate a single solid colour
                      option, chosen by you. All the bars will be the same
                      colour. Select your custom colour using the colour picker
                      below:
                    </p>
                  </div>
                </div>
                <div
                  className={`${styles.colorPicker} ${roboto_condensed.className}`}
                >
                  <label for="colorPicker">Choose a color:</label>
                  <input
                    type="color"
                    id="colorPicker"
                    name="colorPicker"
                    value={selectedColor}
                    onChange={handleColorChange}
                  />
                  {/* <p id="colorCode" className={styles.customColorCode}>{selectedColor}</p> */}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                className={`${roboto_condensed.className} ${styles.paletteLabel}`}
              >
                Pick a Palette:
              </label>
              <div className={styles.paletteContainer}>
                {Object.keys(palettes).map((palette) => (
                  <button
                    key={palette}
                    onClick={() => handlePaletteSelection(palette)}
                    className={roboto_condensed.className}
                    style={{
                      //backgroundColor: palettes[palette][2], // Displaying the middle color as the button color
                      width: "120px",
                      display: "block",
                      height: "30px",
                      margin: "5px",
                      border:
                        selectedPalette === palette
                          ? "1.75px solid #000"
                          : "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      color: "white",
                    }}
                  >
                    {/* {palette.charAt(0).toUpperCase() + palette.slice(1)} */}
                    {palettes[palette].map((color) => {
                      return (
                        <span
                          key={color}
                          style={{
                            backgroundColor: color,
                            color: "transparent",
                          }}
                        >
                          ddd
                        </span>
                      );
                    })}
                  </button>
                ))}
              </div>
            </div>
            {/* Custom Color Settings Start End */}
          </div>

          {/* Clear All Button  */}
          <button
            onClick={handleClearAll}
            className={`${roboto_condensed.className} ${styles.clearAll}`}
          >
            Clear All <ClearIcon />
          </button>
        </div>
        {/* Logo  */}
        <div className={styles.logoWrapper}>
          <h2 className={roboto_condensed.className}>Your Customized Logo</h2>
          {/* Attach the reference to this div */}
          <div ref={logoRef}>
            <div className={styles.logo} id="logo">
              <div
                style={{
                  display: "flex",
                  // margin: "0 auto",
                  alignItems: "flex-end",
                  height: "380px",
                  borderRadius: "10px",
                  overflowX: "hidden",
                  // width: "90%",
                  justifyContent: "center",
                  // width: "430px",
                  // width: "380px",
                  // width: "90%",
                  position: "relative",
                  top: "0",
                  // left: "15%",
                  // marginTop: '4rem'
                  // margin: "30px auto",
                }}
              >
                {Array.from({ length: 5 }).map((_, index) => {
                  // Determine the appropriate color for each bar
                  const barIndex = customBarOrder[index];
                  const selectedKey = selectedValues[barIndex];

                  let backgroundColor;

                  if (singleColorMode) {
                    // In single color mode, use the first selected value's color or the custom color
                    backgroundColor =
                      selectedValues.length > 1
                        ? coreValues[selectedValues[0]].colourHex
                        : selectedValues.length === 1
                        ? coreValues[selectedValues[0]].colourHex
                        : "#e0e0e0";
                  } else if (selectedPalette) {
                    // If a palette is selected, use the corresponding color from the palette
                    backgroundColor = palettes[selectedPalette][index];
                  } else if (selectedColor && isPickerActive) {
                    // Use the custom selected color if no palette is selected
                    backgroundColor = selectedColor;
                  } else {
                    // Default behavior for individual value selection
                    backgroundColor = selectedKey
                      ? coreValues[selectedKey].colourHex
                      : "#e0e0e0";
                  }

                  return (
                    <div
                      key={index}
                      className={styles[`option_${index}`]}
                      style={{
                        flex: 1,
                        backgroundColor: backgroundColor,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        color: "#fff",
                        padding: "10px",
                        boxSizing: "border-box",
                        textAlign: "center",
                        margin: "0 .45rem",
                        borderRadius: "55px",
                        maxWidth: "65px",
                      }}
                    >
                      {selectedKey ? (
                        <>
                          <span
                            className={styles.coreValueLabel}
                            style={{
                              fontSize: "40px",
                              fontWeight: "bold",
                              paddingBottom: ".55rem",
                              //   margin:'2rem auto',
                              display: "flex",
                              alignItems: "center",
                              width: "2rem",

                              color:
                                isPickerActive && textColor
                                  ? textColor
                                  : "white",
                            }}
                          >
                            <h style={{ fontSize: "2rem" }}>
                              {coreValues[selectedKey].shortCode[0]}
                            </h>
                            <p style={{ fontSize: "1.3rem" }}>
                              {coreValues[selectedKey].shortCode[1]}
                            </p>
                          </span>

                          {/* <span style={{ fontSize: '12px' }}>{data[selectedKey].name}</span> */}
                        </>
                      ) : (
                        <span
                          style={{
                            fontSize: "14px",
                            color: "#aaa",
                            paddingBottom: "2rem",
                          }}
                        >
                          Select Value
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* True Me Wordmark  */}
              <div className={styles.wordMarkWrapper}>
                <Image
                  className={styles.wordMark}
                  width={1000}
                  height={1000}
                  src={"/TRUME_wordmarks_classic.png"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Processing  */}
        <div className={styles.buttonWrapper}>
          <div className={styles.finalComfirm}>
            {/* <h2>Finalize Your Logo</h2> */}
            <div className={styles.confirmationWrapper}>
              <div className={styles.quantityContainer}>
                <p className={roboto_condensed.className}>
                  Select product quantity
                </p>
                <div className={styles.quantityBtnWrapper}>
                  <button
                    onClick={decrementQuantity}
                    className={styles.quantityBtn}
                    id="decrementBtn"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    className={styles.quantityInput}
                    id="quantity"
                    value={quantity}
                  />
                  <button
                    onClick={incrementQuantity}
                    className={styles.quantityBtn}
                    id="incrementBtn"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className={`${roboto_condensed.className} ${styles.confirm}`}
                onClick={generateImage}
              >
                Confirm Selection
              </button>
              {/* <button
                className={`${roboto_condensed.className} ${styles.placeOrder}`}
                // style={{ width: "100%" }}
                disabled={!imageData}
                onClick={handlePlaceOrder}
              >
                Place Order
              </button> */}
              {/* Add to cart */}
              {/* <button onClick={() => addToCart(variantId, imageData)}> */}
              {/* <button
                onClick={() => addProductWithCustomLogo(variantId, imageData)}
              >
                Add to Cart
              </button>  */}
              {/* Input field for quantity */}
              {/* <div className={styles.quantityContainer}>
 <label htmlFor="quantity">Quantity</label>
              <input
              className={styles.quantityBtn}
                type="number"
                id="quantity"
                value={quantity}
                min="1"
                onChange={handleQuantityChange} // Update quantity on change
                placeholder="Enter quantity"
              />
              </div> */}

              <button
                className={`${roboto_condensed.className} ${styles.placeOrder}`}
                disabled={!imageData}
                onClick={() =>
                  addProductToCart(
                    checkoutId,
                    { key: "Custom Logo", value: imageData },
                    variantId,
                    quantity
                  )
                }
              >
                Add to Cart
              </button>
              <p
                className={roboto_condensed.className}
                style={{
                  maxWidth: "140px",
                  textAlign: "center",
                  margin: "0 auto",
                }}
              >
                {status}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className={styles.colorPickers}
        style={{ width: "90%", margin: "0 auto" }}
      ></div>
    </div>
  );
}
