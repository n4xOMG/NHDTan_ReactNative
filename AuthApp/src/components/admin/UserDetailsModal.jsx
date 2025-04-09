import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUserActivityLogs } from "../../services/UserServices";
import { getUserRecentComments } from "../../services/CommentService";

const UserDetailsModal = ({ visible, onClose, user, details }) => {
  // Debug helper function
  const safeLog = (message, data) => {
    try {
      console.log(message, data ? JSON.stringify(data) : "no data");
    } catch (e) {
      console.log(message, "Data cannot be stringified");
    }
  };

  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logError, setLogError] = useState(null);
  const [logPage, setLogPage] = useState(0);
  const [logPagination, setLogPagination] = useState({
    page: 0,
    size: 20,
    hasNext: false,
    totalElements: 0,
  });

  const [userComments, setUserComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  useEffect(() => {
    if (visible && user) {
      // Debug the user object
      safeLog("UserDetailsModal visible with user:", user);

      // Reset state when modal becomes visible with a user
      setActivityLogs([]);
      setLogPage(0);
      setLogError(null);
      setLogPagination({
        page: 0,
        size: 20,
        hasNext: false,
        totalElements: 0,
      });

      // Then fetch data
      if (user.username || user.email) {
        safeLog("Fetching activity logs for user:", { email: user.email, username: user.username });
        fetchActivityLogs();
      } else {
        safeLog("No username or email available to fetch logs");
      }

      if (user.id) {
        safeLog("Fetching comments for user ID:", user.id);
        fetchUserComments();
      } else {
        safeLog("No user ID available to fetch comments");
      }
    }
  }, [visible, user]);

  const fetchActivityLogs = async (page = 0) => {
    if (!user) return;

    // Prefer email, but fall back to username if email not available
    const userIdentifier = user.email || user.username;
    if (!userIdentifier) {
      console.warn("No user identifier (email or username) available for fetching logs");
      setLogError("User identifier not available");
      return;
    }

    setLoadingLogs(true);
    setLogError(null);

    try {
      console.log(`Fetching logs for user: ${userIdentifier}, page: ${page}`);
      const result = await getUserActivityLogs(userIdentifier, page, 20);

      // Check if we got a valid result with logs
      if (result && Array.isArray(result.logs)) {
        if (page === 0) {
          setActivityLogs(result.logs);
        } else {
          // Append logs for pagination
          setActivityLogs((prevLogs) => [...prevLogs, ...result.logs]);
        }

        // Update pagination info
        setLogPagination(
          result.pagination || {
            page: page,
            size: 20,
            hasNext: false,
            totalElements: result.logs.length,
          }
        );
        setLogPage(page);
      } else {
        console.warn("Invalid logs result format:", result);
        setLogError("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setLogError("Failed to load activity logs");
      // Reset to empty array on error
      if (page === 0) {
        setActivityLogs([]);
      }
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchUserComments = async () => {
    if (!user || !user.id) {
      safeLog("Cannot fetch comments: missing user or user.id");
      return;
    }

    setLoadingComments(true);
    setCommentsError(null);

    try {
      safeLog("Calling getUserRecentComments with ID:", user.id);
      const comments = await getUserRecentComments(user.id);

      if (!comments) {
        throw new Error("Received null or undefined comments");
      }

      if (!Array.isArray(comments)) {
        safeLog("Received non-array comments:", comments);
        // Convert to array if not already one
        const commentsArray = comments ? [comments] : [];
        setUserComments(commentsArray);
      } else {
        safeLog(`Received ${comments.length} comments`);
        setUserComments(comments);
      }
    } catch (error) {
      console.error("Error fetching user comments:", error);
      setCommentsError("Failed to load user comments");
      setUserComments([]); // Ensure we reset to empty array
    } finally {
      setLoadingComments(false);
    }
  };

  const loadMoreLogs = () => {
    if (logPagination.hasNext && !loadingLogs) {
      fetchActivityLogs(logPage + 1);
    }
  };

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
        <Text style={styles.itemTitle}>{item.product || "Credit Package"}</Text>
        <Text style={styles.itemPrice}>${item.price?.toFixed(2) || "N/A"}</Text>
      </View>
      <Text style={styles.itemContent}>Credits: {item.creditAmount || "N/A"}</Text>
      <Text style={styles.itemDate}>{formatDate(item.purchaseDate || item.date)}</Text>
    </View>
  );

  const renderCommentItem = ({ item }) => {
    // Determine which context this comment belongs to
    let contextTitle = "Unknown context";
    if (item.bookId) {
      contextTitle = `Book #${item.bookId}`;
    } else if (item.chapterId) {
      contextTitle = `Chapter #${item.chapterId}`;
    } else if (item.postId) {
      contextTitle = `Post #${item.postId}`;
    }

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>On: {contextTitle}</Text>
        <Text style={styles.itemContent}>"{item.content}"</Text>
        <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
        {item.parentCommentId && <Text style={styles.replyInfo}>Reply to comment #{item.parentCommentId}</Text>}
      </View>
    );
  };

  const renderActivityItem = ({ item }) => {
    if (!item) return null; // Skip rendering if item is undefined

    return (
      <View style={styles.itemContainer}>
        <View style={styles.activityRow}>
          <View
            style={[
              styles.activityType,
              item.type === "login" ? styles.loginActivity : item.type === "profile_update" ? styles.updateActivity : styles.otherActivity,
            ]}
          >
            <Text style={styles.activityTypeText}>{(item.type || "unknown").replace("_", " ")}</Text>
          </View>
          <Text style={styles.itemDate}>{formatDate(item.date || new Date())}</Text>
        </View>
        <Text style={styles.itemContent}>{item.details || "No details available"}</Text>
      </View>
    );
  };

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
              {loadingComments ? (
                <ActivityIndicator size="small" color="#4a80f5" />
              ) : commentsError ? (
                <Text style={styles.errorText}>{commentsError}</Text>
              ) : !userComments || userComments.length === 0 ? (
                <Text style={styles.emptyText}>No comments found</Text>
              ) : (
                <FlatList
                  data={userComments}
                  renderItem={renderCommentItem}
                  keyExtractor={(item, index) => item?.id?.toString() || `comment-${index}-${Date.now()}`}
                  scrollEnabled={false}
                  removeClippedSubviews={false}
                />
              )}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              {loadingLogs && logPage === 0 ? (
                <ActivityIndicator size="small" color="#4a80f5" />
              ) : logError ? (
                <Text style={styles.errorText}>{logError}</Text>
              ) : activityLogs.length === 0 ? (
                <Text style={styles.emptyText}>No activities found</Text>
              ) : (
                <>
                  <FlatList
                    data={activityLogs}
                    renderItem={renderActivityItem}
                    keyExtractor={(item, index) => item?.id || `fallback-key-${index}-${Date.now()}`}
                    scrollEnabled={false}
                    onEndReached={loadMoreLogs}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={false} // May help with rendering issues
                  />
                  {loadingLogs && logPage > 0 && <ActivityIndicator size="small" color="#4a80f5" style={styles.loadingMore} />}
                  {!loadingLogs && logPagination.hasNext && (
                    <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreLogs}>
                      <Text style={styles.loadMoreText}>Load More</Text>
                    </TouchableOpacity>
                  )}
                  {!logPagination.hasNext && activityLogs.length > 0 && <Text style={styles.noMoreText}>No more activities</Text>}
                </>
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
  replyInfo: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 3,
  },
  loadingMore: {
    marginTop: 10,
  },
  loadMoreButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  loadMoreText: {
    color: "#4a80f5",
    fontWeight: "bold",
  },
  noMoreText: {
    textAlign: "center",
    color: "#999",
    padding: 10,
    fontStyle: "italic",
    fontSize: 12,
  },
});

export default UserDetailsModal;
