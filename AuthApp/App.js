import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./src/navigation/AppNavigator";
import { persistor, store } from "./src/redux/store";
import { LogBox } from "react-native";
import { useEffect } from "react";

LogBox.ignoreLogs([
  "TNodeChildrenRenderer: Support for defaultProps will be removed",
  "MemoizedTNodeRenderer: Support for defaultProps will be removed",
]);
export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
}
