import { useRef } from 'react';
import html2canvas from 'html2canvas';

export default function LogoDesigner({ onImageUpload }) {
  const logoRef = useRef(null);

  const generateImage = async () => {
    const canvas = await html2canvas(logoRef.current);
    const imageUrl = canvas.toDataURL('image/png');
    const uploadedUrl = await uploadImageToCloudinary(imageUrl);
    onImageUpload(uploadedUrl);
  };

  const uploadImageToCloudinary = async (imageData) => {
    const formData = new FormData();
    formData.append('file', imageData);
    formData.append('upload_preset', 'trume-test'); // Replace with Cloudinary preset

    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.secure_url; // Return the Cloudinary URL
  };

  return (
    <div>
      <div ref={logoRef} style={{ width: '300px', height: '150px', backgroundColor: '#333' }}>
        <h1 style={{ color: '#fff' }}>Custom Logo</h1>
      </div>
      <button onClick={generateImage}>Generate and Upload Logo</button>
    </div>
  );
}
