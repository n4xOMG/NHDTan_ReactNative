const generateUniqueUploadId = () => {
  return `uqid-${Date.now()}`;
};

export const UploadToCloudinary = async (file, folder) => {
  if (!file || !file.uri) {
    console.error("Please select a valid file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    type: file.type || "image/jpeg", // Default type if missing
    name: file.name || "upload.jpg",
  });

  formData.append("cloud_name", process.env.EXPO_PUBLIC_CLOUD_NAME);
  formData.append("upload_preset", process.env.EXPO_PUBLIC_UPLOAD_PRESET);
  formData.append("folder", folder);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Upload failed.");
    }

    return data.secure_url; // Return uploaded image URL
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export default UploadToCloudinary;
