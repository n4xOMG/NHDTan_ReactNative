const generateUniqueUploadId = () => {
  return `uqid-${Date.now()}`;
};

export const UploadToCloudinary = async (file, folder, retryCount = 0) => {
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

  // Ensure the file URI is valid - remove file:// prefix if on Android
  let fileUri = file.uri;
  if (Platform.OS === "android" && fileUri.startsWith("file://")) {
    fileUri = fileUri.replace("file://", "");
  }

  const formData = new FormData();

  // Ensure proper MIME type based on file extension
  let mimeType = file.type || "image/jpeg";
  if (!mimeType || mimeType === "image") {
    // Try to infer mime type from extension
    if (fileUri.toLowerCase().endsWith(".png")) {
      mimeType = "image/png";
    } else if (fileUri.toLowerCase().endsWith(".jpg") || fileUri.toLowerCase().endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (fileUri.toLowerCase().endsWith(".gif")) {
      mimeType = "image/gif";
    } else if (fileUri.toLowerCase().endsWith(".webp")) {
      mimeType = "image/webp";
    }
  }

  // Prepare file object with proper MIME type
  const fileToUpload = {
    uri: file.uri,
    type: mimeType,
    name: file.name || `upload_${Date.now()}.${mimeType.split("/")[1] || "jpg"}`,
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

    // Set a timeout for the fetch request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Upload request timed out")), 30000); // 30 second timeout
    });

    // Create fetch promise
    const fetchPromise = fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

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

    // Implement retry logic (maximum 2 retries)
    if (retryCount < 2 && (error.message.includes("Network request failed") || error.message.includes("timed out"))) {
      console.log(`UploadToCloudinary: Retrying upload (attempt ${retryCount + 1})...`);
      // Wait 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return UploadToCloudinary(file, folder, retryCount + 1);
    }

    throw error;
  }
};

export default UploadToCloudinary;
