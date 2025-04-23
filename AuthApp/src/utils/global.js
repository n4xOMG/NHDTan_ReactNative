import { randomBytes } from "react-native-get-random-values";

// Polyfill for crypto
if (typeof global.crypto !== "object") {
  global.crypto = {};
}

if (typeof global.crypto.getRandomValues !== "function") {
  global.crypto.getRandomValues = function getRandomValues(arr) {
    const bytes = randomBytes(arr.length);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = bytes[i];
    }
    return arr;
  };
}
