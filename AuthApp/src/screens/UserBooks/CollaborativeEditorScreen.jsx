import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import { getChapterRoomId } from "../../services/ChapterServices";
import { colors } from "../../style/modernStyles";

// Default fallback if environment variable not set
const DEFAULT_EDITOR_URL = "http://10.0.2.2:3000";

const CollaborativeEditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookId, chapterId, initialContent, roomId: initialRoomId, returnRoute } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomId, setRoomId] = useState(initialRoomId || "");
  const [token, setToken] = useState(null);
  const [webViewKey, setWebViewKey] = useState(1); // Used to refresh WebView
  const webViewRef = useRef(null);
  const [editorBaseUrl, setEditorBaseUrl] = useState("");
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState("");
  const [debugInfo, setDebugInfo] = useState({ lastStatus: null, chapterLoading: true }); // Track debug information

  // Get auth state from Redux
  const { isLoggedIn, token: reduxToken } = useSelector((state) => state.auth);

  useEffect(() => {
    // Try to get the previously saved editor URL
    const loadEditorUrl = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem("editorServerUrl");
        setEditorBaseUrl(savedUrl || process.env.EXPO_PUBLIC_EDITOR_URL || DEFAULT_EDITOR_URL);
      } catch (err) {
        console.error("Error loading editor URL:", err);
        setEditorBaseUrl(process.env.EXPO_PUBLIC_EDITOR_URL || DEFAULT_EDITOR_URL);
      }
    };

    const fetchToken = async () => {
      try {
        // First try to get token from Redux
        if (reduxToken) {
          setToken(reduxToken);
          return;
        }

        // Fallback to AsyncStorage
        const storedToken = await AsyncStorage.getItem("userToken");
        if (storedToken) {
          setToken(storedToken);
        } else {
          setError("Authentication required. Please log in to use the editor.");
        }
      } catch (err) {
        console.error("Error fetching token:", err);
        setError("Failed to retrieve authentication information.");
      }
    };

    const fetchOrCreateRoomId = async () => {
      // If roomId is already provided, use it
      if (initialRoomId) {
        setRoomId(initialRoomId);
        return;
      }

      try {
        // Get or create a room ID from the API
        const response = await getChapterRoomId({
          chapterId,
          bookId,
        });

        if (response && response.roomId) {
          setRoomId(response.roomId);
        } else {
          setError("Failed to create collaboration room.");
        }
      } catch (err) {
        console.error("Error getting/creating room ID:", err);
        setError("Failed to setup collaborative editing session.");
      }
    };

    loadEditorUrl();
    fetchToken();
    fetchOrCreateRoomId();
  }, [reduxToken, initialRoomId, chapterId, bookId]);

  // Create the editor URL with roomId only (no JWT in URL)
  const getEditorUrl = () => {
    if (!roomId || !editorBaseUrl) return null;

    // Build URL with roomId only
    return `${editorBaseUrl}/edit-chapter/${roomId}`;
  };

  const handleRefresh = () => {
    setWebViewKey((prevKey) => prevKey + 1);
    setLoading(true);
    setError(null);
  };

  const handleGoBack = () => {
    // Navigate back to the chapter editor screen
    if (returnRoute) {
      navigation.navigate(returnRoute, { roomId });
    } else {
      navigation.goBack();
    }
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setError(`Failed to load editor: ${nativeEvent.description || "Connection error"}`);
    setLoading(false);
  };

  const handleUpdateServerUrl = async () => {
    if (!customServerUrl.trim()) {
      Alert.alert("Error", "Please enter a valid server URL");
      return;
    }

    try {
      // Save the URL
      await AsyncStorage.setItem("editorServerUrl", customServerUrl.trim());
      setEditorBaseUrl(customServerUrl.trim());
      setShowServerConfig(false);
      setCustomServerUrl("");
      handleRefresh();
    } catch (err) {
      console.error("Error saving server URL:", err);
      Alert.alert("Error", "Failed to save server URL");
    }
  };

  // Script to inject JWT token into the web editor securely via localStorage
  const getInjectedJavaScript = () => {
    if (!token) return "";
    return `
    // Override console.log to send logs to React Native
    (function() {
      var originalConsoleLog = console.log;
      console.log = function(...args) {
        originalConsoleLog.apply(console, args);
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CONSOLE_LOG',
            message: args.join(' ')
          }));
        } catch (e) {
          originalConsoleLog('Error sending console log:', e);
        }
      };
    })();

    // Global error handler
    window.onerror = function(message, source, lineno, colno, error) {
      if (message && (
          message.includes('destroy is not a function') ||
          message.includes('LiveblocksYjsProvider') ||
          message.includes('withYjs') ||
          message.includes('Y.Doc') ||
          message.includes('@slate-yjs/core')
        )) {
        console.warn('Suppressed Liveblocks/Yjs error:', message);
        return true;
      }
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'JS_ERROR',
        message: message,
        source: source,
        lineno: lineno,
        colno: colno,
        error: error ? error.stack : null
      }));
    };

    // Create a communication channel to debug Redux/chapter state
    window.debugChapterState = function() {
      try {
        let stateInfo = { chapter: null, auth: null, lastAction: window.__lastChapterActionType || 'N/A' };
        if (window.store && typeof window.store.getState === 'function') {
          const state = window.store.getState();
          stateInfo.chapter = state.chapter;
          stateInfo.auth = state.auth ? { isLoggedIn: state.auth.isLoggedIn } : null;
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'DEBUG_STATE',
          state: stateInfo
        }));
        if (window.__chapterLoadingStatus) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CHAPTER_LOADING',
            status: window.__chapterLoadingStatus
          }));
        }
      } catch (e) {
        console.warn('Error in debugChapterState:', e);
      }
    };

    // Setup listener for chapter component mount
    document.addEventListener('DOMContentLoaded', function() {
      window.__debugInterval = setInterval(window.debugChapterState, 2000);
      try {
        if (typeof React !== 'undefined' && React.createElement) {
          const originalReactCreateElement = React.createElement;
          React.createElement = function(type, props, ...children) {
            if (typeof type === 'function' && (type.name === 'CollaborativeEditor' || type.name === 'CollaborativeEditorWrapper')) {
              window.__chapterLoadingStatus = type.name + '_MOUNTED';
              window.debugChapterState();
            }
            return originalReactCreateElement.apply(this, arguments);
          };
        }
      } catch(e) {
        console.warn('Failed to patch React.createElement for debugging:', e);
      }
    });

    // Patch for Yjs document and LiveblocksYjsProvider destruction
    (function() {
      if (window.Y && window.Y.Doc) {
        const originalDocDestroy = window.Y.Doc.prototype.destroy;
        window.Y.Doc.prototype.destroy = function() {
          try {
            if (typeof originalDocDestroy === 'function') {
              originalDocDestroy.apply(this, arguments);
            }
          } catch (e) {
            console.warn('Suppressed Y.Doc destroy error:', e);
          }
        };
      }
      setTimeout(function() {
        if (window.store && window.store.dispatch) {
          const originalDispatch = window.store.dispatch;
          window.store.dispatch = function(action) {
            if (action && action.type && action.type.includes('chapter/getChapterByRoomId')) {
              window.__lastChapterActionType = action.type;
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'REDUX_ACTION',
                action: {
                  type: action.type,
                  meta: action.meta,
                  error: action.error ? action.error.message : null,
                  timestamp: Date.now()
                }
              }));
              setTimeout(window.debugChapterState, 50);
            }
            return originalDispatch.apply(this, arguments);
          };
          console.log('Redux dispatch patched for chapter actions.');
        } else {
          console.warn('window.store or window.store.dispatch not found for patching.');
        }
      }, 1500);
    })();

    // Set auth token
    console.log('Injecting JWT:', '${token}');
    localStorage.setItem('jwt', '${token}');
    window.dispatchEvent(new CustomEvent('tokenAvailable', { detail: { source: 'reactNative' } }));
    true;
  `;
  };

  const handleMessage = (event) => {
    console.log("Raw WebView Message:", event.nativeEvent.data);
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "CONSOLE_LOG") {
        console.log("WebView Console:", data.message);
      } else if (data.type === "JS_ERROR") {
        console.error("WebView JavaScript error:", data);
        if (
          (data.message &&
            (data.message.includes("destroy is not a function") ||
              data.message.includes("LiveblocksYjsProvider") ||
              data.message.includes("withYjs") ||
              data.message.includes("Y.Doc") ||
              data.message.includes("@slate-yjs/core"))) ||
          (data.error &&
            (data.error.includes("destroy is not a function") ||
              data.error.includes("LiveblocksYjsProvider") ||
              data.error.includes("withYjs") ||
              data.error.includes("Y.Doc") ||
              data.error.includes("@slate-yjs/core")))
        ) {
          console.warn("Ignoring Liveblocks/Yjs error in UI");
          return;
        }
        setError(`JavaScript error: ${data.message || "Unknown JS Error"}`);
      } else if (data.type === "DEBUG_STATE") {
        console.log("State from WebView:", data.state);
        const isLoading = !data.state?.chapter?.chapter;
        const lastAction = data.state?.lastAction || debugInfo.lastAction;
        setDebugInfo((prev) => ({
          ...prev,
          reduxState: data.state,
          chapterLoading: isLoading,
          lastStatus: isLoading ? `Waiting for chapter... (Last Action: ${lastAction})` : "Chapter data present",
          lastAction: lastAction,
        }));
        if (isLoading && lastAction?.includes("rejected") && webViewRef.current) {
          console.warn("Chapter fetch rejected, consider manual refresh or check logs.");
        } else if (isLoading && !lastAction?.includes("pending") && webViewRef.current) {
          console.log("Chapter seems stuck, attempting force refresh injection.");
        }
      } else if (data.type === "CHAPTER_LOADING") {
        console.log("Component loading status:", data.status);
        setDebugInfo((prev) => ({
          ...prev,
          lastStatus: data.status,
        }));
      } else if (data.type === "REDUX_ACTION") {
        console.log("Redux chapter action dispatched:", data.action);
        setDebugInfo((prev) => ({ ...prev, lastAction: data.action.type }));
        if (data.action.type?.includes("rejected")) {
          console.error("Chapter fetch action rejected:", data.action.error || data.action.meta);
          setError(`Failed to load chapter data: ${data.action.error || "Unknown error"}`);
        }
      } else if (data.type === "CONTENT_UPDATED") {
        console.log("Content updated:", data.content);
      } else if (data.type === "AUTH_ERROR") {
        setError(`Authentication error: ${data.message}`);
      } else if (data.type === "AUTH_REQUIRED") {
        if (webViewRef.current && token) {
          webViewRef.current.injectJavaScript(`
          console.log('Re-injecting token on AUTH_REQUIRED');
          localStorage.setItem('jwt', '${token}');
          if (window.authCallback) window.authCallback();
          window.dispatchEvent(new CustomEvent('tokenAvailable', { detail: { source: 'reactNativeRetry' } }));
          true;
        `);
        } else {
          setError("Authentication required, but no token available to reinject.");
        }
      }
    } catch (err) {
      console.error("Error parsing WebView message:", err, "Raw data:", event.nativeEvent.data);
    }
  };

  // Handle changes in authentication state
  useEffect(() => {
    if (webViewRef.current && token) {
      webViewRef.current.injectJavaScript(`
        localStorage.setItem('jwt', '${token}');
        // Notify any listeners that the token is updated
        const tokenEvent = new CustomEvent('tokenUpdated', { detail: { source: 'reactNative' } });
        document.dispatchEvent(tokenEvent);
        true;
      `);
    }
  }, [token, webViewRef.current]);

  const editorUrl = getEditorUrl();

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Collaborative Editor</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => setShowServerConfig(true)}>
            <Icon name="settings-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="warning-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>

          {/* Additional troubleshooting info for connection errors */}
          {error.includes("ERR_CONNECTION_REFUSED") && (
            <View style={styles.troubleshootContainer}>
              <Text style={styles.troubleshootTitle}>Troubleshooting Tips:</Text>
              <Text style={styles.troubleshootText}>• Make sure your web editor server is running</Text>
              <Text style={styles.troubleshootText}>• Check if you're using the correct server URL</Text>
              <Text style={styles.troubleshootText}>• For Android emulator, use 10.0.2.2 instead of localhost</Text>
              <Text style={styles.troubleshootText}>• Current server URL: {editorBaseUrl}</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.retryButton, styles.configButton]} onPress={() => setShowServerConfig(true)}>
              <Text style={styles.retryButtonText}>Configure Server</Text>
            </TouchableOpacity>
          </View>

          {!isLoggedIn && (
            <TouchableOpacity style={[styles.retryButton, styles.loginButton]} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.retryButtonText}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Server Configuration Modal */}
        {showServerConfig && (
          <View style={styles.configModal}>
            <View style={styles.configModalContent}>
              <View style={styles.configHeader}>
                <Text style={styles.configTitle}>Configure Editor Server</Text>
                <TouchableOpacity onPress={() => setShowServerConfig(false)}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <Text style={styles.configLabel}>Current URL: {editorBaseUrl}</Text>

              <Text style={styles.configHint}>
                For Android emulator, use 10.0.2.2 instead of localhost. For iOS simulator, use localhost. For physical devices, use your
                computer's IP address.
              </Text>

              <TextInput
                style={styles.configInput}
                value={customServerUrl}
                onChangeText={setCustomServerUrl}
                placeholder="Enter server URL (e.g., http://10.0.2.2:3000)"
                placeholderTextColor="#999"
              />

              <View style={styles.configButtons}>
                <TouchableOpacity style={[styles.configButton, styles.cancelButton]} onPress={() => setShowServerConfig(false)}>
                  <Text style={styles.configButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.configButton} onPress={handleUpdateServerUrl}>
                  <Text style={styles.configButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (!editorUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Collaborative Editor</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Preparing collaborative editor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Collaborative Editor</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Icon name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading editor...</Text>
        </View>
      )}

      {debugInfo.chapterLoading && !loading && (
        <View style={styles.debugBanner}>
          <Text style={styles.debugText}>{debugInfo.lastStatus || "Loading chapter data..."}</Text>
          {/* Optionally show last action type */}
          {debugInfo.lastAction && <Text style={styles.debugTextSmall}>Last Action: {debugInfo.lastAction}</Text>}
        </View>
      )}

      <WebView
        ref={webViewRef}
        key={webViewKey}
        source={{ uri: editorUrl }}
        style={styles.webView}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          setLoading(false);
        }}
        onError={handleWebViewError}
        injectedJavaScript={getInjectedJavaScript()}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        userAgent={`ReactNativeWebView/${Platform.OS}`}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 10,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  configButton: {
    backgroundColor: colors.secondary,
  },
  loginButton: {
    backgroundColor: "#4a80f5",
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  troubleshootContainer: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  troubleshootText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  configModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  configModalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  configHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  configLabel: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
  },
  configHint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  configInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  configButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#ddd",
  },
  configButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  debugBanner: {
    backgroundColor: "rgba(255, 235, 59, 0.9)", // Slightly more opaque
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    position: "absolute",
    top: 56, // Below header - Adjust if header height changes
    left: 0,
    right: 0,
    zIndex: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#cca700",
  },
  debugText: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  debugTextSmall: {
    // Style for additional debug info
    fontSize: 11,
    color: "#555",
    textAlign: "center",
    marginTop: 2,
  },
});

export default CollaborativeEditorScreen;
