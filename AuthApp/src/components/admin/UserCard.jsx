import React from "react";
import { View, Text, Image, TouchableOpacity, Switch } from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { usermanagestyles } from "../../style/usermanagestyles";

const UserCard = ({ item, onToggleStatus, onEdit, onBanUser, onViewDetails }) => {
  return (
    <View style={usermanagestyles.userItem}>
      <Image source={{ uri: item.avatarUrl || "https://randomuser.me/api/portraits/lego/1.jpg" }} style={usermanagestyles.userAvatar} />
      <View style={usermanagestyles.userInfo}>
        <Text style={usermanagestyles.userName}>{item.fullname || item.username}</Text>
        <Text style={usermanagestyles.userEmail}>{item.email}</Text>
        <View style={usermanagestyles.userDetails}>
          <View style={usermanagestyles.badge}>
            <Text style={[usermanagestyles.badgeText, { color: item.role?.name === "ADMIN" ? "#ff6b00" : "#0066ff" }]}>
              {item.role?.name || "USER"}
            </Text>
          </View>

          {item.isBanned ? (
            <View style={[usermanagestyles.statusBadge, { backgroundColor: "#ffe6e6" }]}>
              <View style={[usermanagestyles.statusDot, { backgroundColor: "#ff3333" }]} />
              <Text style={[usermanagestyles.statusText, { color: "#cc0000" }]}>BANNED</Text>
            </View>
          ) : item.isSuspended ? (
            <View style={[usermanagestyles.statusBadge, { backgroundColor: "#fff8e6" }]}>
              <View style={[usermanagestyles.statusDot, { backgroundColor: "#ffcc00" }]} />
              <Text style={[usermanagestyles.statusText, { color: "#cc9900" }]}>SUSPENDED</Text>
            </View>
          ) : (
            <View style={[usermanagestyles.statusBadge, { backgroundColor: "#e6f7ee" }]}>
              <View style={[usermanagestyles.statusDot, { backgroundColor: "#00cc66" }]} />
              <Text style={[usermanagestyles.statusText, { color: "#00994d" }]}>ACTIVE</Text>
            </View>
          )}
        </View>

        {item.isVerified && (
          <View style={usermanagestyles.verifiedBadge}>
            <FontAwesome name="check-circle" size={12} color="#4a80f5" />
            <Text style={usermanagestyles.verifiedText}>Verified</Text>
          </View>
        )}

        {item.isBanned && <Text style={usermanagestyles.banReason}>Reason: {item.banReason}</Text>}

        <Text style={usermanagestyles.joinDate}>Credits: {item.credits || 0}</Text>
      </View>
      <View style={usermanagestyles.actionButtons}>
        <Switch
          trackColor={{ false: "#ddd", true: "#bfe8d4" }}
          thumbColor={!item.isSuspended ? "#00cc66" : "#ff3333"}
          ios_backgroundColor="#ddd"
          onValueChange={() => onToggleStatus(item)}
          value={!item.isSuspended}
          style={usermanagestyles.statusSwitch}
        />
        <TouchableOpacity onPress={() => onEdit(item)} style={usermanagestyles.editButton}>
          <MaterialIcons name="edit" size={22} color="#4a80f5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onBanUser(item)} style={usermanagestyles.deleteButton}>
          <MaterialIcons name={item.isBanned ? "restore" : "block"} size={22} color={item.isBanned ? "#4a80f5" : "#f44336"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onViewDetails(item)} style={usermanagestyles.detailsButton}>
          <MaterialIcons name="person" size={22} color="#607D8B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserCard;
