import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

export const NavigationBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState(route.name || "Home");

  const navItems = [
    {
      name: "Home",
      icon: "home",
      label: "Home",
      screen: "Home",
    },
    {
      name: "Posts",
      icon: "post",
      label: "Posts",
      screen: "Posts",
    },
    {
      name: "MyBooks",
      icon: "bookshelf",
      label: "My Books",
      screen: "MyBooks",
    },
    {
      name: "Credits",
      icon: "wallet",
      label: "Credits",
      screen: "Credits",
    },
  ];

  const handleTabPress = (screenName) => {
    setActiveTab(screenName);
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity key={item.name} style={styles.tabButton} onPress={() => handleTabPress(item.screen)} activeOpacity={0.7}>
          <View style={styles.tabContent}>
            <Icon name={item.icon} size={24} color={activeTab === item.screen ? "#2196F3" : "#A0A0A0"} />
            <Text style={[styles.tabLabel, activeTab === item.screen && styles.activeLabel]}>{item.label}</Text>
            {activeTab === item.screen && <View style={styles.activeIndicator} />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 60,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "#A0A0A0",
  },
  activeLabel: {
    color: "#2196F3",
    fontWeight: "500",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#2196F3",
  },
});

export default NavigationBar;
