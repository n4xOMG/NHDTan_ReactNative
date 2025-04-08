import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { creditmanagestyles } from "../../style/creditmanagestyles";

const CreditPackageItem = ({ item, onEdit, onDelete, onToggleActive, onTogglePopular }) => {
  return (
    <View style={[creditmanagestyles.packageItem, !item.isActive && creditmanagestyles.inactivePackage]}>
      <View style={creditmanagestyles.packageIconContainer}>
        <Text style={creditmanagestyles.packageIcon}>{item.icon}</Text>
        {item.isPopular && (
          <View style={creditmanagestyles.popularBadge}>
            <Text style={creditmanagestyles.popularText}>Popular</Text>
          </View>
        )}
      </View>

      <View style={creditmanagestyles.packageInfo}>
        <Text style={creditmanagestyles.packageName}>{item.name}</Text>
        <Text style={creditmanagestyles.packageDescription}>{item.description}</Text>

        <View style={creditmanagestyles.packageDetails}>
          <View style={creditmanagestyles.detailItem}>
            <FontAwesome5 name="coins" size={12} color="#666" />
            <Text style={creditmanagestyles.detailText}>{item.credits} credits</Text>
          </View>

          {item.duration && (
            <View style={creditmanagestyles.detailItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={creditmanagestyles.detailText}>{item.duration} days</Text>
            </View>
          )}
        </View>

        <View style={creditmanagestyles.priceContainer}>
          <Text style={creditmanagestyles.packagePrice}>${item.price.toFixed(2)}</Text>
          <Text style={creditmanagestyles.priceLabel}>{(item.credits / item.price).toFixed(1)} credits/$</Text>
        </View>
      </View>

      <View style={creditmanagestyles.actionButtons}>
        <TouchableOpacity
          style={[creditmanagestyles.actionButton, creditmanagestyles.popularButton]}
          onPress={() => onTogglePopular(item.id, item.isPopular)}
        >
          <Ionicons name={item.isPopular ? "star" : "star-outline"} size={22} color={item.isPopular ? "#ffc107" : "#888"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEdit(item)} style={creditmanagestyles.actionButton}>
          <MaterialIcons name="edit" size={22} color="#4a80f5" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDelete(item.id)} style={creditmanagestyles.actionButton}>
          <MaterialIcons name="delete" size={22} color="#f44336" />
        </TouchableOpacity>

        <Switch
          trackColor={{ false: "#ddd", true: "#bfe8d4" }}
          thumbColor={item.isActive ? "#00cc66" : "#ff3333"}
          ios_backgroundColor="#ddd"
          onValueChange={() => onToggleActive(item.id, item.isActive)}
          value={item.isActive}
          style={creditmanagestyles.statusSwitch}
        />
      </View>
    </View>
  );
};

export default CreditPackageItem;
