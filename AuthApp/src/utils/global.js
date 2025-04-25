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

// Polyfill for window in React Native environment
if (typeof global.window === 'undefined') {
  global.window = global;
}

// Polyfill for window.addEventListener
if (typeof global.window.addEventListener !== 'function') {
  global.window.addEventListener = (type, listener) => {
    // No-op or implement your own event system if needed
  };
}

// Polyfill for window.removeEventListener
if (typeof global.window.removeEventListener !== 'function') {
  global.window.removeEventListener = (type, listener) => {
    // No-op or implement your own event system if needed
  };
}

// Polyfill for document
if (typeof global.document === 'undefined') {
  global.document = {};
}

// Polyfill for window.location
if (typeof global.window.location === 'undefined') {
  global.window.location = {
    href: '',
    protocol: 'https:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'https://localhost',
    assign: function() {},
    reload: function() {},
    replace: function() {},
    toString: function() { return 'https://localhost/'; }
  };
}

// Polyfill for URL constructor
if (typeof global.URL === 'undefined') {
  global.URL = class URL {
    constructor(url, base) {
      this.href = url || '';
      this.protocol = 'https:';
      this.host = 'localhost';
      this.hostname = 'localhost';
      this.port = '';
      this.pathname = '/';
      this.search = '';
      this.hash = '';
      this.origin = 'https://localhost';
    }
    
    toString() {
      return this.href;
    }
  };
}
