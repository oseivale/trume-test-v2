export const uploadImageToCloudinary = async (imageData) => {
  const formData = new FormData();
  formData.append('file', imageData); // The image data (base64 format from html2canvas)
  formData.append('upload_preset', 'trume-test'); // Unsigned upload preset created in Cloudinary dashboard

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.secure_url) {
      console.log('Image uploaded to Cloudinary:', data.secure_url);
      return data.secure_url; // Return the URL for further use
    } else {
      console.error('Error uploading image:', data);
      return null;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
