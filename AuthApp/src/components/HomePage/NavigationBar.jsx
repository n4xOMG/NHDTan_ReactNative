import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { modernStyles, colors } from "../../style/modernStyles";

export const NavigationBar = () => {
  const navigation = useNavigation();

  return (
    <View style={modernStyles.navigationBar}>
      <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("Home")}>
        <Icon name="home" size={24} color={colors.primary} />
        <Text style={{ color: colors.primary, marginTop: 4, fontSize: 12 }}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("BookList")}>
        <Icon name="book" size={24} color={colors.text.secondary} />
        <Text style={{ color: colors.text.secondary, marginTop: 4, fontSize: 12 }}>Books</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("Cart")}>
        <Icon name="cart" size={24} color={colors.text.secondary} />
        <Text style={{ color: colors.text.secondary, marginTop: 4, fontSize: 12 }}>Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("Profile")}>
        <Icon name="person" size={24} color={colors.text.secondary} />
        <Text style={{ color: colors.text.secondary, marginTop: 4, fontSize: 12 }}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NavigationBar;
