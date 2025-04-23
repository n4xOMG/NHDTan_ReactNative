import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { API_BASE_URL } from "../api/api";

export const setupYjs = (roomId) => {
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText("editor");

  const base = API_BASE_URL.replace(/\/api\/?$/, "").replace(/^https/, "wss");
  // Provide only the base WebSocket URL, y-websocket will append /<roomId>
  const wsBaseUrl = `${base}/yjsws`;
  const provider = new WebsocketProvider(
    wsBaseUrl, // Base ws url (e.g., ws://localhost:8181/yjsws)
    roomId, // Room name (y-websocket appends this to the base url)
    ydoc,
    { WebSocketPolyfill: WebSocket } // use React Native’s WS, no SockJS
  );
  console.log("WebSocket URL:", wsBaseUrl);
  return { ydoc, ytext, provider };
};
