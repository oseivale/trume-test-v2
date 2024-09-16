// import { useRef } from 'react';
// import html2canvas from 'html2canvas';

// export default function LogoDesigner({ onImageUpload }) {
//   const logoRef = useRef(null);

//   const generateImage = async () => {
//     const canvas = await html2canvas(logoRef.current);
//     const imageUrl = canvas.toDataURL('image/png');
//     const uploadedUrl = await uploadImageToCloudinary(imageUrl);
//     onImageUpload(uploadedUrl);
//   };

//   const uploadImageToCloudinary = async (imageData) => {
//     const formData = new FormData();
//     formData.append('file', imageData);
//     formData.append('upload_preset', 'trume-test'); // Replace with Cloudinary preset

//     const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
//       method: 'POST',
//       body: formData,
//     });

//     const data = await response.json();
//     return data.secure_url; // Return the Cloudinary URL
//   };

//   return (
//     <div>
//       <div ref={logoRef} style={{ width: '300px', height: '150px', backgroundColor: '#333' }}>
//         <h1 style={{ color: '#fff' }}>Custom Logo</h1>
//       </div>
//       <button onClick={generateImage}>Generate and Upload Logo</button>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { uploadImageToCloudinary } from "../lib/cloudinary";
import { data } from "../data";
import styles from "./styles.module.css";
import { toPng, toJpeg } from "html-to-image";
import { roboto_condensed } from "@/fonts";

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
  // Create a reference to the logo div
  const logoRef = useRef(null);
  const [imageData, setImageData] = useState("");
  const [status, setStatus] = useState("");

  // Predefined colors for the user to choose from
  const colorOptions = ["#FF5733", "#33FF57", "#3357FF", "#FFD700", "#FF33A8"];

  // Color palettes for the user to choose from
  const palettes = {
    blue: ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087"],
    green: ["#006400", "#228B22", "#32CD32", "#7CFC00", "#ADFF2F"],
    red: ["#8B0000", "#B22222", "#DC143C", "#FF4500", "#FF6347"],
  };

  const [selectedColor, setSelectedColor] = useState(null); // To store the selected color

  const [selectedValues, setSelectedValues] = useState([]);
  const [singleColorMode, setSingleColorMode] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(null); // To store the selected palette

  // Custom order for mapping selected values to bars
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
    setSelectedColor(null); // Clear the selected color
    setSingleColorMode(false); // Turn off single color mode
    setSelectedPalette(null);
  };

  const handleToggleSingleColor = () => {
    setSingleColorMode(!singleColorMode);
    if (!singleColorMode) {
      setSelectedColor(null); // Deselect the preset color if Single Color Mode is activated
      setSelectedPalette(null);
    }
  };
  const handleColorSelection = (color) => {
    if (selectedColor === color) {
      setSelectedColor(null); // Deselect the color
    } else {
      setSelectedColor(color);
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
      setSelectedColor(null); // Deselect any custom color
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
          setImageData(dataUrl);
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
          variant_id: 9323,
          quantity: 1,
          files: [
            {
              url: "http://example.com/files/posters/poster_1.jpg",
            },
          ],
        },
      ],
    };

    const productVariantId = "44582110658737"; // Printful product variant ID

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

  return (
    <div className={`${styles.customizationContainer }${roboto_condensed.className}`}>
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
        <p className={roboto_condensed.className}>
          Select any 5 of the core value options below. Your core values will
          show up in the logo template below. Core value selection order
          goes from the tallest bar to the shortest.
        </p>
        <div className={styles.coreValueWrapper}>
          {Object.keys(data).map((key) => {
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
                  backgroundColor: isSelected ? data[key].colourHex : "#D4D4D4",
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
                  {data[key].shortCode}
                </span>
                <span
                  className={`${roboto_condensed.className} ${styles.name}`}
                >
                  {data[key].name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div
        className={`${styles.customization}`}
        style={{ width: "90%", margin: "0 auto" }}
      >
        <div className={styles.confirmOptions}>
          {/* Custom Color Settings Start  */}
          {/* <h2>Additional Customization Options</h2> */}
          <div>
             <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div>
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
            </div>
          </div>
          <div className={styles.customColor} style={{ marginBottom: "20px" }}>
            <label
              className={`${roboto_condensed.className} ${styles.customColorLabel}`}
            >
              Pick a Custom Color:
            </label>
            <div>
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelection(color)}
                  style={{
                    backgroundColor: color,
                    width: "30px",
                    height: "30px",
                    margin: "0 5px",
                    border: selectedColor === color ? "3px solid #000" : "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              className={`${roboto_condensed.className} ${styles.paletteLabel}`}
            >
              Pick a Palette:
            </label>
            <div>
              {Object.keys(palettes).map((palette) => (
                <button
                  key={palette}
                  onClick={() => handlePaletteSelection(palette)}
                  className={roboto_condensed.className}
                  style={{
                    backgroundColor: palettes[palette][2], // Displaying the middle color as the button color
                    width: "60px",
                    height: "30px",
                    margin: "0 5px",
                    border:
                      selectedPalette === palette ? "3px solid #000" : "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  {palette.charAt(0).toUpperCase() + palette.slice(1)}
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
      <div
          id="logo"
          ref={logoRef} // Attach the reference to this div
          style={{
            display: "flex",
            margin: '0 auto',
            alignItems: "flex-end",
            height: "350px",
            borderRadius: "10px",
            overflow: "hidden",
            //   width: "430px",
            width: "400px",
            position: "relative",
            top: "0",
            // left: "15%",
            // marginTop: '4rem'
            //   margin: "30px auto",
          }}
        >
          
          {Array.from({ length: 5 }).map((_, index) => {
            // const barIndex = customBarOrder[index];
            //   const selectedKey = selectedValues[barIndex];
            //   const backgroundColor = singleColorMode
            //     ? selectedValues.length > 1
            //       ? data[selectedValues[0]].colourHex
            //       : '#e0e0e0'
            //     : selectedColor
            //     ? selectedColor
            //     : selectedKey
            //     ? data[selectedKey].colourHex
            //     : '#e0e0e0';

            // Determine the appropriate color for each bar
            const barIndex = customBarOrder[index];
            const selectedKey = selectedValues[barIndex];

            let backgroundColor;

            if (singleColorMode) {
              // In single color mode, use the first selected value's color or the custom color
              backgroundColor =
                selectedValues.length > 1
                  ? data[selectedValues[0]].colourHex
                  : selectedValues.length === 1
                  ? data[selectedValues[0]].colourHex
                  : "#e0e0e0";
            } else if (selectedPalette) {
              // If a palette is selected, use the corresponding color from the palette
              backgroundColor = palettes[selectedPalette][index];
            } else if (selectedColor) {
              // Use the custom selected color if no palette is selected
              backgroundColor = selectedColor;
            } else {
              // Default behavior for individual value selection
              backgroundColor = selectedKey
                ? data[selectedKey].colourHex
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
                  marginRight: "1rem",
                  borderRadius: "55px",
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
                        color: "white",
                      }}
                    >
                      <h style={{ fontSize: "2rem" }}>
                        {data[selectedKey].shortCode[0]}
                      </h>
                      <p style={{ fontSize: "1.3rem" }}>
                        {data[selectedKey].shortCode[1]}
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
      </div>
        
        {/* Image Processing  */}
        <div className={styles.buttonWrapper}>
  
          <div className={styles.finalComfirm}>
          {/* <h2>Finalize Your Logo</h2> */}
            <div className={styles.confirmationWrapper}>
              <button
                className={`${roboto_condensed.className} ${styles.confirm}`}
                onClick={generateImage}
              >
                Confirm Selection
              </button>
              <button
                className={`${roboto_condensed.className} ${styles.placeOrder}`}
                // style={{ width: "100%" }}
                disabled={!imageData}
                onClick={handlePlaceOrder}
              >
                Place Order
              </button>
              <p
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
