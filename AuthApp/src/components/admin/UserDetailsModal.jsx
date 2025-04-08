import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const UserDetailsModal = ({ visible, onClose, user, details }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderPurchaseItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.product}</Text>
        <Text style={styles.itemPrice}>${item.amount.toFixed(2)}</Text>
      </View>
      <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
    </View>
  );

  const renderCommentItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>On: {item.postTitle}</Text>
      <Text style={styles.itemContent}>"{item.content}"</Text>
      <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
    </View>
  );

  const renderActivityItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.activityRow}>
        <View
          style={[
            styles.activityType,
            item.type === "login" ? styles.loginActivity : item.type === "profile_update" ? styles.updateActivity : styles.otherActivity,
          ]}
        >
          <Text style={styles.activityTypeText}>{item.type.replace("_", " ")}</Text>
        </View>
        <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.itemContent}>{item.details}</Text>
    </View>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{user.fullname}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.roleBadge}>
                <Text style={styles.badgeText}>{user.role?.name || "USER"}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  user.isBanned ? styles.bannedBadge : user.isSuspended ? styles.suspendedBadge : styles.activeBadge,
                ]}
              >
                <Text style={styles.badgeText}>{user.isBanned ? "Banned" : user.isSuspended ? "Suspended" : "Active"}</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.detailsContainer}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Purchase History</Text>
              {details.loading ? (
                <ActivityIndicator size="small" color="#4a80f5" />
              ) : details.error ? (
                <Text style={styles.errorText}>{details.error}</Text>
              ) : details.purchaseHistory.length === 0 ? (
                <Text style={styles.emptyText}>No purchase history found</Text>
              ) : (
                <FlatList
                  data={details.purchaseHistory}
                  renderItem={renderPurchaseItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recent Comments</Text>
              {details.loading ? (
                <ActivityIndicator size="small" color="#4a80f5" />
              ) : details.error ? (
                <Text style={styles.errorText}>{details.error}</Text>
              ) : details.comments.length === 0 ? (
                <Text style={styles.emptyText}>No comments found</Text>
              ) : (
                <FlatList
                  data={details.comments}
                  renderItem={renderCommentItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              {details.loading ? (
                <ActivityIndicator size="small" color="#4a80f5" />
              ) : details.error ? (
                <Text style={styles.errorText}>{details.error}</Text>
              ) : details.activities.length === 0 ? (
                <Text style={styles.emptyText}>No activities found</Text>
              ) : (
                <FlatList
                  data={details.activities}
                  renderItem={renderActivityItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  userInfoContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  badgeContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  roleBadge: {
    backgroundColor: "#4a80f5",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 10,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  activeBadge: {
    backgroundColor: "#4CAF50",
  },
  suspendedBadge: {
    backgroundColor: "#FFC107",
  },
  bannedBadge: {
    backgroundColor: "#F44336",
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
  },
  detailsContainer: {
    flex: 1,
  },
  sectionContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  itemContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4a80f5",
  },
  itemContent: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  itemDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityType: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  loginActivity: {
    backgroundColor: "#4a80f5",
  },
  updateActivity: {
    backgroundColor: "#9C27B0",
  },
  otherActivity: {
    backgroundColor: "#607D8B",
  },
  activityTypeText: {
    color: "white",
    fontSize: 12,
    textTransform: "capitalize",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    textAlign: "center",
    padding: 10,
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    padding: 10,
    fontStyle: "italic",
  },
});

export default UserDetailsModal;
