import React, { useState, useEffect } from "react";
import { View, FlatList, ActivityIndicator, Alert, SafeAreaView, StatusBar } from "react-native";
import { getAllUsers, updateUserStatus } from "../../services/UserServices";
import { usermanagestyles } from "../../style/usermanagestyles";

// Import components
import UserStatsHeader from "../../components/admin/UserStatsHeader";
import SearchBar from "../../components/admin/SearchBar";
import UserFilters from "../../components/admin/UserFilters";
import SortHeader from "../../components/admin/SortHeader";
import UserCard from "../../components/admin/UserCard";
import EditUserModal from "../../components/admin/EditUserModal";
import EmptyUserList from "../../components/admin/EmptyUserList";
import UserDetailsModal from "../../components/admin/UserDetailsModal";

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("fullname");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  // For the edit/add modal
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("USER");
  const [userStatus, setUserStatus] = useState("active");
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState({
    purchaseHistory: [],
    comments: [],
    activities: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(page, size, searchQuery);
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to fetch users");
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  useEffect(() => {
    // Apply filters and search
    let result = [...users];

    // Filter by role
    if (filterRole !== "all") {
      result = result.filter((user) => user.role && user.role.name === filterRole);
    }

    // Filter by status
    if (filterStatus !== "all") {
      if (filterStatus === "active") {
        result = result.filter((user) => !user.isSuspended && !user.isBanned);
      } else if (filterStatus === "suspended") {
        result = result.filter((user) => user.isSuspended);
      } else if (filterStatus === "banned") {
        result = result.filter((user) => user.isBanned);
      }
    }

    // Apply sort
    result.sort((a, b) => {
      let aValue, bValue;

      // Handle nested properties
      if (sortBy === "role") {
        aValue = a.role?.name || "";
        bValue = b.role?.name || "";
      } else {
        aValue = a[sortBy] || "";
        bValue = b[sortBy] || "";
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

    setFilteredUsers(result);
  }, [users, sortOrder, sortBy, filterRole, filterStatus]);

  const handleSort = (key) => {
    const newSortOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortOrder(newSortOrder);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setUserName(user.fullname || "");
    setUserEmail(user.email || "");
    setUserRole(user.role?.name || "USER");
    setUserStatus(user.isSuspended ? "suspended" : user.isBanned ? "banned" : "active");
    setIsBanned(user.isBanned || false);
    setBanReason(user.banReason || "");
    setModalVisible(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      const newSuspendedStatus = !user.isSuspended;

      await updateUserStatus(user.id, newSuspendedStatus, user.isBanned, user.banReason);

      // Update local state
      setUsers(users.map((u) => (u.id === user.id ? { ...u, isSuspended: newSuspendedStatus } : u)));

      Alert.alert("Success", `User ${newSuspendedStatus ? "suspended" : "activated"} successfully`);
    } catch (error) {
      console.error("Error updating user status:", error);
      Alert.alert("Error", "Failed to update user status");
    }
  };

  const handleBanUser = async (user) => {
    try {
      const newBanStatus = !user.isBanned;

      if (newBanStatus) {
        // Show dialog to enter ban reason
        Alert.prompt(
          "Ban User",
          "Please enter a reason for banning this user:",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Ban",
              onPress: async (reason) => {
                if (!reason) {
                  Alert.alert("Error", "A reason is required to ban a user");
                  return;
                }

                await updateUserStatus(user.id, user.isSuspended, true, reason);

                // Update local state
                setUsers(users.map((u) => (u.id === user.id ? { ...u, isBanned: true, banReason: reason } : u)));

                Alert.alert("Success", "User banned successfully");
              },
            },
          ],
          "plain-text"
        );
      } else {
        // Unban user
        await updateUserStatus(user.id, user.isSuspended, false, "");

        // Update local state
        setUsers(users.map((u) => (u.id === user.id ? { ...u, isBanned: false, banReason: "" } : u)));

        Alert.alert("Success", "User unbanned successfully");
      }
    } catch (error) {
      console.error("Error updating ban status:", error);
      Alert.alert("Error", "Failed to update ban status");
    }
  };

  const handleSearch = () => {
    setPage(0); // Reset to first page
    fetchUsers();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchUsers();
  };

  const handleSave = () => {
    if (!userName || !userEmail) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // In a real implementation, you would call an API endpoint to update the user
    Alert.alert("Not Implemented", "User update API not implemented yet");
    setModalVisible(false);
  };

  const fetchUserDetails = async (userId) => {
    setUserDetails((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // In a real app, these would be separate API calls
      // const purchases = await getUserPurchases(userId);
      // const comments = await getUserComments(userId);
      // const activities = await getUserActivities(userId);

      // Simulate API calls with mock data for now
      setTimeout(() => {
        const mockPurchases = [
          { id: 1, date: "2023-05-15", product: "Premium Subscription", amount: 29.99 },
          { id: 2, date: "2023-06-20", product: "E-Book Bundle", amount: 19.99 },
        ];

        const mockComments = [
          { id: 1, date: "2023-06-01", content: "Great article!", postTitle: "Getting Started with React Native" },
          { id: 2, date: "2023-06-15", content: "This was very helpful", postTitle: "Advanced State Management" },
        ];

        const mockActivities = [
          { id: 1, date: "2023-06-25", type: "login", details: "Login from new device" },
          { id: 2, date: "2023-06-26", type: "profile_update", details: "Changed profile picture" },
        ];

        setUserDetails({
          purchaseHistory: mockPurchases,
          comments: mockComments,
          activities: mockActivities,
          loading: false,
          error: null,
        });
      }, 1000);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserDetails((prev) => ({ ...prev, loading: false, error: "Failed to load user details" }));
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailsModalVisible(true);
    fetchUserDetails(user.id);
  };

  return (
    <SafeAreaView style={usermanagestyles.container}>
      <StatusBar barStyle="dark-content" />

      <UserStatsHeader users={users} />

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} handleClear={handleClearSearch} />

      <UserFilters filterRole={filterRole} setFilterRole={setFilterRole} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

      <SortHeader sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} />

      {loading ? (
        <ActivityIndicator size="large" color="#4a80f5" style={usermanagestyles.loader} />
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={({ item }) => (
            <UserCard
              item={item}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEdit}
              onBanUser={handleBanUser}
              onViewDetails={handleViewDetails}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={usermanagestyles.listContainer}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={<EmptyUserList />}
        />
      )}

      <EditUserModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        currentUser={currentUser}
        userName={userName}
        setUserName={setUserName}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        userRole={userRole}
        setUserRole={setUserRole}
        userStatus={userStatus}
        setUserStatus={setUserStatus}
        banReason={banReason}
        setBanReason={setBanReason}
        setIsBanned={setIsBanned}
        handleSave={handleSave}
      />

      <UserDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        user={selectedUser}
        details={userDetails}
      />
    </SafeAreaView>
  );
};

export default UserManagementScreen;
