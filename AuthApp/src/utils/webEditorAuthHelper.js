// Script to handle authentication in the collaborative editor
// This needs to be included in your web-based editor

// Auth helper functions
const authHelper = {
  // Get the JWT token from localStorage (where React Native stores it)
  getToken: () => {
    return localStorage.getItem("jwtToken");
  },

  // Check if token exists
  isAuthenticated: () => {
    const token = localStorage.getItem("jwtToken");
    return !!token;
  },

  // Set up axios instance with auth header
  getAxiosInstance: (axios, baseURL) => {
    const token = localStorage.getItem("jwtToken");
    return axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },

  // Listen for token updates from React Native
  setupTokenListener: (callback) => {
    document.addEventListener("tokenAvailable", (event) => {
      if (callback && typeof callback === "function") {
        callback(localStorage.getItem("jwtToken"));
      }
    });

    document.addEventListener("tokenUpdated", (event) => {
      if (callback && typeof callback === "function") {
        callback(localStorage.getItem("jwtToken"));
      }
    });

    // Provide immediate callback if token already exists
    const existingToken = localStorage.getItem("jwtToken");
    if (existingToken && callback && typeof callback === "function") {
      callback(existingToken);
    }
  },

  // Request token from React Native environment
  requestToken: () => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "AUTH_REQUIRED",
        })
      );
    }
  },
};

// Example usage:
// 1. Set up listener for token
// authHelper.setupTokenListener((token) => {
//   console.log('Token received or updated:', token);
//   // Initialize your editor with authentication
// });
//
// 2. Check authentication before operations
// if (authHelper.isAuthenticated()) {
//   // Proceed with authenticated operation
// } else {
//   // Request authentication
//   authHelper.requestToken();
// }
//
// 3. Get authenticated axios instance for API calls
// const api = authHelper.getAxiosInstance(axios, 'http://your-api-url');
// api.get('/endpoint').then(response => {...})

export default authHelper;
