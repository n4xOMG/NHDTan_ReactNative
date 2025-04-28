const generateUniqueUploadId = () => {
  return `uqid-${Date.now()}`;
};

export const UploadToCloudinary = async (file, folder) => {
  if (!file || !file.uri) {
    console.error("UploadToCloudinary: Please select a valid file.");
    return;
  }

  console.log("UploadToCloudinary: Starting upload process for file:", {
    uri: file.uri,
    type: file.type || "image/jpeg",
    name: file.name || "upload.jpg",
    size: file.fileSize || "unknown",
  });

  console.log("UploadToCloudinary: Target folder:", folder);

  // Verify environment variables
  if (!process.env.EXPO_PUBLIC_CLOUD_NAME || !process.env.EXPO_PUBLIC_UPLOAD_PRESET) {
    console.error("UploadToCloudinary: Missing Cloudinary configuration.");
    console.log("CLOUD_NAME:", process.env.EXPO_PUBLIC_CLOUD_NAME ? "Set" : "Missing");
    console.log("UPLOAD_PRESET:", process.env.EXPO_PUBLIC_UPLOAD_PRESET ? "Set" : "Missing");
    throw new Error("Missing Cloudinary configuration");
  }

  const formData = new FormData();

  // Prepare file object with proper MIME type
  const fileToUpload = {
    uri: file.uri,
    type: file.type || "image/jpeg", // Default type if missing
    name: file.name || `upload_${Date.now()}.jpg`,
  };

  console.log("UploadToCloudinary: Preparing file for upload:", fileToUpload);

  formData.append("file", fileToUpload);
  formData.append("cloud_name", process.env.EXPO_PUBLIC_CLOUD_NAME);
  formData.append("upload_preset", process.env.EXPO_PUBLIC_UPLOAD_PRESET);
  formData.append("folder", folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUD_NAME}/auto/upload`;
  console.log("UploadToCloudinary: Uploading to URL:", uploadUrl);

  try {
    console.log("UploadToCloudinary: Starting fetch request...");

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    console.log("UploadToCloudinary: Response status:", response.status);
    console.log("UploadToCloudinary: Response headers:", JSON.stringify(response.headers));

    if (!response.ok) {
      console.error("UploadToCloudinary: Response not OK:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("UploadToCloudinary: Error response body:", errorText);
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("UploadToCloudinary: Upload successful, received data:", {
      asset_id: data.asset_id,
      public_id: data.public_id,
      version: data.version,
      url: data.url,
      secure_url: data.secure_url,
    });

    return data.secure_url; // Return uploaded image URL
  } catch (error) {
    console.error("UploadToCloudinary: Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error.response) {
      console.error("UploadToCloudinary: Error response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
      });
    }

    throw error;
  }
};

export default UploadToCloudinary;
