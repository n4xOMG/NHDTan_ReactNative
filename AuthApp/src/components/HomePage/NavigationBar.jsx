import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { modernStyles, colors } from "../../style/modernStyles";
import NotificationIcon from "../NotificationIcon";

export const NavigationBar = () => {
  const navigation = useNavigation();

  return (
    <View style={modernStyles.navigationBar}>
      <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("Home")}>
        <Icon name="home" size={24} color={colors.primary} />
        <Text style={{ color: colors.primary, marginTop: 4, fontSize: 12 }}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("UserBooks")}>
        <Icon name="library" size={24} color={colors.text.secondary} />
        <Text style={{ color: colors.text.secondary, marginTop: 4, fontSize: 12 }}>My Books</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("Posts")}>
        <Icon name="newspaper-outline" size={24} color={colors.text.secondary} />
        <Text style={{ color: colors.text.secondary, marginTop: 4, fontSize: 12 }}>Posts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("PaymentScreen")}>
        <Icon name="wallet" size={24} color={colors.text.secondary} />
        <Text style={{ color: colors.text.secondary, marginTop: 4, fontSize: 12 }}>Credits</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ alignItems: "center" }} onPress={() => {}}>
        <NotificationIcon />
        <Text style={{ color: colors.text.secondary, marginTop: 4, fontSize: 12 }}>Noti</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NavigationBar;
