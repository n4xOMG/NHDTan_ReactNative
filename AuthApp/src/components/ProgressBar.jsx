import React from "react";
import { View } from "react-native";

const ProgressBar = ({ progress, color, style, height, borderRadius, unfilledColor }) => {
  return (
    <View style={[{ height: height || 10, borderRadius: borderRadius || 4, backgroundColor: unfilledColor || "#e0e0e0" }, style]}>
      <View
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          backgroundColor: color || "#3498db",
          borderRadius: borderRadius || 4,
        }}
      />
    </View>
  );
};

export default ProgressBar;
