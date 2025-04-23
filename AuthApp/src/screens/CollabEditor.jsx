import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { WebView } from "react-native-webview";
import { getChapterById, getChapterRoomId, saveChapterContent } from "../services/ChapterServices";
import { colors } from "../style/modernStyles";
import { setupYjs } from "../utils/yjs-utils";

// Add Buffer polyfill for Yjs
global.Buffer = global.Buffer || require("buffer").Buffer;

const CollabEditor = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookId, chapterId, initialContent, roomId: existingRoomId, onContentChange } = route.params || {};

  const [content, setContent] = useState(initialContent || "");
  const [roomId, setRoomId] = useState(existingRoomId || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const webViewRef = useRef(null);
  const yjsRef = useRef(null);

  // HTML template for rich text editor with Yjs integration
  const editorHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 10px;
          color: #333;
          background-color: #fff;
          font-size: 16px;
        }
        #editor {
          min-height: 300px;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 10px;
          outline: none;
        }
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          padding: 5px;
          background-color: #f5f5f5;
          border-radius: 5px;
          margin-bottom: 10px;
        }
        .toolbar button {
          margin: 2px;
          padding: 5px 10px;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 3px;
          cursor: pointer;
        }
        .toolbar button:hover {
          background-color: #f0f0f0;
        }
        .toolbar button.active {
          background-color: #e6e6e6;
          font-weight: bold;
        }
        .spacer {
          width: 10px;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <button onclick="execCommand('bold')"><b>B</b></button>
        <button onclick="execCommand('italic')"><i>I</i></button>
        <button onclick="execCommand('underline')"><u>U</u></button>
        <div class="spacer"></div>
        <button onclick="execCommand('justifyLeft')">Left</button>
        <button onclick="execCommand('justifyCenter')">Center</button>
        <button onclick="execCommand('justifyRight')">Right</button>
        <div class="spacer"></div>
        <button onclick="execCommand('insertUnorderedList')">• List</button>
        <button onclick="execCommand('insertOrderedList')">1. List</button>
        <div class="spacer"></div>
        <button onclick="insertImage()">Image</button>
      </div>
      <div id="editor" contenteditable="true"></div>

      <script>
        let editor = document.getElementById('editor');
        
        // Initialize editor with content
        function setContent(html) {
          editor.innerHTML = html || '';
        }
        
        // Get current content
        function getContent() {
          return editor.innerHTML;
        }
        
        // Execute formatting commands
        function execCommand(command, value = null) {
          document.execCommand(command, false, value);
          editor.focus();
          
          // Notify React Native about content change
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'contentChange',
            content: editor.innerHTML
          }));
        }
        
        // Handle image insertion
        function insertImage() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'requestImageUpload'
          }));
        }
        
        // Insert image at current position
        function insertImageUrl(url) {
          execCommand('insertHTML', '<img src="' + url + '" alt="Uploaded image" />');
        }
        
        // Set up input handlers to detect changes
        editor.addEventListener('input', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'contentChange',
            content: editor.innerHTML
          }));
        });
        
        // Let React Native know the editor is ready
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'editorReady'
        }));
      </script>
    </body>
    </html>
  `;

  // Initialize or get room ID
  useEffect(() => {
    const initRoomId = async () => {
      if (existingRoomId) {
        setRoomId(existingRoomId);
        return;
      }

      try {
        setLoading(true);
        // Get or create room ID
        const response = await getChapterRoomId({
          chapterId,
          bookId,
        });

        if (response && response.roomId) {
          setRoomId(response.roomId);
        } else {
          throw new Error("Failed to get room ID");
        }
      } catch (err) {
        console.error("Error getting room ID:", err);
        setError("Failed to initialize collaborative editing. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initRoomId();
  }, [existingRoomId, chapterId, bookId]);

  // Fetch content if room ID is available
  useEffect(() => {
    const fetchChapterContent = async () => {
      if (!roomId) return;

      try {
        setLoading(true);
        // If initialContent is provided, use it, otherwise fetch from server
        if (!initialContent) {
          const data = await getChapterById(chapterId);
          if (data && data.content) {
            setContent(data.content);
          }
        }
      } catch (err) {
        console.error("Error fetching chapter content:", err);
        setError("Failed to load chapter content.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapterContent();
  }, [roomId, initialContent]);

  // Set up Yjs when room ID is available and editor is ready
  useEffect(() => {
    if (!roomId || !editorReady) return;

    try {
      // Initialize Yjs with polyfill already in place
      yjsRef.current = setupYjs(roomId);

      // Set initial content to Yjs
      if (content) {
        yjsRef.current.ytext.delete(0, yjsRef.current.ytext.length);
        yjsRef.current.ytext.insert(0, content);
      }

      // Listen for changes in the Yjs text
      yjsRef.current.ytext.observe((event) => {
        try {
          const newContent = yjsRef.current.ytext.toString();
          setContent(newContent);

          // Update the editor content
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              setContent(${JSON.stringify(newContent)});
              true;
            `);
          }
        } catch (observeError) {
          console.error("Error in Yjs observe callback:", observeError);
        }
      });

      // Connection status
      yjsRef.current.provider.on("status", (event) => {
        setConnected(event.status === "connected");
      });

      return () => {
        // Clean up Yjs
        if (yjsRef.current && yjsRef.current.provider) {
          yjsRef.current.provider.disconnect();
          yjsRef.current = null;
        }
      };
    } catch (err) {
      console.error("Error setting up Yjs:", err);
      setError("Failed to initialize collaborative editing: " + err.message);
    }
  }, [roomId, content, editorReady]);

  // Handle messages from WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case "editorReady":
          setEditorReady(true);
          // Once editor is ready, set the initial content
          if (content && webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              setContent(${JSON.stringify(content)});
              true;
            `);
          }
          break;

        case "contentChange":
          if (data.content !== content) {
            setContent(data.content);

            // Update Yjs content
            if (yjsRef.current && yjsRef.current.ytext) {
              yjsRef.current.ytext.delete(0, yjsRef.current.ytext.length);
              yjsRef.current.ytext.insert(0, data.content);
            }
          }
          break;

        case "requestImageUpload":
          // In a real app, you would implement image upload here
          Alert.alert(
            "Image Upload",
            "Image upload is not implemented in this demo. In a real app, you would select an image from your device or take a photo.",
            [{ text: "OK" }]
          );
          break;
      }
    } catch (err) {
      console.error("Error handling WebView message:", err);
    }
  };

  // Save content
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveChapterContent(roomId, content);

      // Notify parent component about the content change
      if (onContentChange) {
        onContentChange(content, roomId);
      }

      Alert.alert("Success", "Content saved successfully");
    } catch (err) {
      console.error("Error saving content:", err);
      Alert.alert("Error", "Failed to save content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing collaborative editor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="alert-circle" size={48} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Collaborative Editor</Text>
        <View style={styles.headerRight}>
          <Text style={[styles.statusIndicator, connected ? styles.connected : styles.disconnected]}>
            {connected ? "Connected" : "Disconnected"}
          </Text>
          <TouchableOpacity style={[styles.saveButton, isSaving && styles.disabledButton]} onPress={handleSave} disabled={isSaving}>
            {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.editorContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: editorHTML }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scrollEnabled
          automaticallyAdjustContentInsets
          style={styles.webView}
        />
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Text style={styles.collaborationInfo}>Room ID: {roomId}</Text>
        <Text style={styles.collaborationInfo}>{connected ? "Collaborative editing is active" : "Waiting for connection..."}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text.secondary,
  },
  errorText: {
    marginTop: 10,
    color: colors.danger,
    textAlign: "center",
    marginBottom: 20,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: colors.primary + "80", // Add opacity
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statusIndicator: {
    fontSize: 12,
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  connected: {
    backgroundColor: "#e6f7e6",
    color: "#2e7d32",
  },
  disconnected: {
    backgroundColor: "#ffebee",
    color: "#c62828",
  },
  editorContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  webView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  collaborationInfo: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CollabEditor;
