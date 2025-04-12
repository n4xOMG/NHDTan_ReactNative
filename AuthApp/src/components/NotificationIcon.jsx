import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnreadNotifications, markAllNotificationsAsRead, addNotification } from "../redux/slices/notificationSlice";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../api/api";
import { colors } from "../style/modernStyles";

const NotificationIcon = () => {
  const dispatch = useDispatch();
  const { unreadNotifications, loading } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);
  const jwtToken = useSelector((state) => state.auth.token);

  const [modalVisible, setModalVisible] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    // Fetch initial unread notifications
    dispatch(fetchUnreadNotifications());

    // Only set up WebSocket if we have a user and token
    if (user?.username && jwtToken) {
      // WebSocket setup
      const socket = new SockJS(`${API_BASE_URL}/ws`);
      const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${jwtToken}`,
        },
        debug: (str) => console.log("STOMP: ", str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      stompClient.onConnect = (frame) => {
        console.log("Connected to WebSocket", frame);
        stompClient.subscribe(`/user/${user.username}/notifications`, (message) => {
          try {
            const notification = JSON.parse(message.body);
            console.log("New notification received:", notification);
            dispatch(addNotification(notification));
          } catch (error) {
            console.error("Error processing notification:", error);
            console.log("Raw message:", message.body);
          }
        });
      };

      stompClient.onStompError = (error) => {
        console.error("STOMP error:", error);
      };

      stompClient.onWebSocketError = (error) => {
        console.error("WebSocket error:", error);
      };

      stompClientRef.current = stompClient;
      stompClient.activate();

      return () => {
        if (stompClientRef.current && stompClientRef.current.connected) {
          stompClientRef.current.deactivate();
          console.log("Disconnected from WebSocket");
        }
      };
    }
  }, [dispatch, jwtToken, user?.username]);

  // This useEffect will log when the unreadNotifications change
  useEffect(() => {
    console.log("Unread notifications updated:", unreadNotifications.length);
  }, [unreadNotifications]);

  const handleNotificationClick = () => {
    setModalVisible(true);
  };

  const handleMarkAllAsRead = () => {
    if (unreadNotifications.length > 0) {
      const notificationIds = unreadNotifications.map((n) => n.id);
      dispatch(markAllNotificationsAsRead(notificationIds));
      setModalVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handleNotificationClick} disabled={loading}>
        <View style={styles.iconContainer}>
          <Icon name="notifications" size={24} color={colors.text.secondary} />
          {unreadNotifications.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadNotifications.length > 99 ? "99+" : unreadNotifications.length}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Notification List Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {unreadNotifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Icon name="notifications-off-outline" size={60} color="#ddd" />
                <Text style={styles.noNotifications}>No unread notifications</Text>
              </View>
            ) : (
              <ScrollView style={styles.notificationList}>
                {unreadNotifications.map((notification) => (
                  <View key={notification.id} style={styles.notificationItem}>
                    <Icon name="alert-circle" size={20} color={colors.primary} style={styles.notificationIcon} />
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationText}>{notification.message}</Text>
                      <Text style={styles.notificationDate}>{new Date(notification.createdDate).toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {unreadNotifications.length > 0 && (
              <TouchableOpacity style={styles.markAsReadButton} onPress={handleMarkAllAsRead}>
                <Text style={styles.markAsReadText}>Mark All as Read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  notificationList: {
    width: "100%",
    maxHeight: 400,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  emptyNotifications: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  noNotifications: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
  },
  markAsReadButton: {
    backgroundColor: colors.primary,
    padding: 15,
    alignItems: "center",
  },
  markAsReadText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default NotificationIcon;
