import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { modernStyles, colors } from "../../style/modernStyles";
import { useSelector } from "react-redux";

const TopBarNavigation = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user); // Assuming role is stored in auth redux state

  const handleChange = (text) => {
    setSearchText(text);
    onSearch(text);
  };

  return (
    <View style={modernStyles.topBar}>
      <Text style={modernStyles.title}>BookStore</Text>
      <View style={modernStyles.searchBar}>
        <Icon name="search-outline" size={20} color={colors.darkGray} />
        <TextInput
          style={{ flex: 1, marginLeft: 8, color: colors.text.primary }}
          placeholder="Search books..."
          placeholderTextColor={colors.mediumGray}
          value={searchText}
          onChangeText={handleChange}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleChange("")}>
            <Icon name="close-circle" size={20} color={colors.darkGray} />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {user?.role.name === "ADMIN" && (
          <TouchableOpacity onPress={() => navigation.navigate("Dashboard")} style={{ padding: 8 }} accessibilityLabel="Admin Dashboard">
            <Icon name="shield-half-outline" size={26} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={{ padding: 8 }}>
          <Icon name="person-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TopBarNavigation;
