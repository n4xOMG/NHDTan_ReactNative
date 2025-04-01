import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnreadNotifications, markAllNotificationsAsRead, addNotification } from "../redux/slices/notificationSlice";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../api/api";

const NotificationIcon = () => {
  const dispatch = useDispatch();
  const { unreadNotifications, loading } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);
  const jwtToken = useSelector((state) => state.auth.token);

  const [modalVisible, setModalVisible] = useState(false); // State for showing/hiding the notification list

  useEffect(() => {
    // Fetch initial unread notifications
    dispatch(fetchUnreadNotifications());

    // WebSocket setup
    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${jwtToken}`,
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log("Connected to WebSocket");
      stompClient.subscribe(`/user/${user.username}/notifications`, (message) => {
        const notification = JSON.parse(message.body);
        console.log("Notification: ", notification);
        dispatch(addNotification(notification));
      });
    };

    stompClient.onStompError = (error) => {
      console.error("STOMP error:", error);
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
      console.log("Disconnected from WebSocket");
    };
  }, [dispatch, jwtToken, user?.username]);

  const handleNotificationClick = () => {
    setModalVisible(true); // Show the notification list
  };

  const handleMarkAllAsRead = () => {
    if (unreadNotifications.length > 0) {
      const notificationIds = unreadNotifications.map((n) => n.id);
      dispatch(markAllNotificationsAsRead(notificationIds));
      setModalVisible(false); // Close the modal after marking as read
    }
  };

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>{item.message}</Text>
      <Text style={styles.notificationDate}>{new Date(item.createdDate).toLocaleString()}</Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handleNotificationClick} disabled={loading}>
        <Icon name="bell" size={30} color="white" />
        {unreadNotifications.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadNotifications.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notification List Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications</Text>
            {unreadNotifications.length === 0 ? (
              <Text style={styles.noNotifications}>No unread notifications</Text>
            ) : (
              <ScrollView style={styles.notificationList}>
                {unreadNotifications.map((notification) => (
                  <View key={notification.id} style={styles.notificationItem}>
                    <Text style={styles.notificationText}>{notification.message}</Text>
                    <Text style={styles.notificationDate}>{new Date(notification.createdDate).toLocaleString()}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.markAsReadButton} onPress={handleMarkAllAsRead}>
              <Text style={styles.markAsReadText}>Mark All as Read</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginRight: 10,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  notificationList: {
    width: "100%",
  },
  notificationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  notificationText: {
    fontSize: 16,
  },
  notificationDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  noNotifications: {
    fontSize: 16,
    color: "#888",
    marginVertical: 20,
  },
  markAsReadButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  markAsReadText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
});

export default NotificationIcon;
