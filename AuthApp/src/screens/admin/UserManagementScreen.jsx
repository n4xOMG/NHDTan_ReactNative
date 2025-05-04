import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StatusBar } from "react-native";
import { getPurchaseHistoryByUser } from "../../services/PurchaseServices"; // Add this import
import {
  banUser,
  deleteUser,
  getAllUsers,
  suspendUser,
  unbanUser,
  unsuspendUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from "../../services/UserServices";
import { usermanagestyles } from "../../style/usermanagestyles";

// Import components
import EditUserModal from "../../components/admin/EditUserModal";
import EmptyUserList from "../../components/admin/EmptyUserList";
import SearchBar from "../../components/admin/SearchBar";
import SortHeader from "../../components/admin/SortHeader";
import UserCard from "../../components/admin/UserCard";
import UserDetailsModal from "../../components/admin/UserDetailsModal";
import UserFilters from "../../components/admin/UserFilters";
import UserStatsHeader from "../../components/admin/UserStatsHeader";

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

      // Use the new dedicated suspend/unsuspend functions
      if (newSuspendedStatus) {
        await suspendUser(user.id);
      } else {
        await unsuspendUser(user.id);
      }

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

                await banUser(user.id);

                // Update local state
                setUsers(users.map((u) => (u.id === user.id ? { ...u, isBanned: true, banReason: reason } : u)));

                Alert.alert("Success", "User banned successfully");
              },
            },
          ],
          "plain-text"
        );
      } else {
        // Unban user using the dedicated function
        await unbanUser(user.id);

        // Update local state
        setUsers(users.map((u) => (u.id === user.id ? { ...u, isBanned: false, banReason: "" } : u)));

        Alert.alert("Success", "User unbanned successfully");
      }
    } catch (error) {
      console.error("Error updating ban status:", error);
      Alert.alert("Error", "Failed to update ban status");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);

      // Update local state
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: { name: newRole } } : u)));

      Alert.alert("Success", "User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      Alert.alert("Error", "Failed to update user role");
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

  const handleSave = async () => {
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

    try {
      if (currentUser) {
        // Prepare updated user data
        const updatedUserData = {
          fullname: userName,
          email: userEmail,
          // Add any other fields that need updating
        };

        // Call the API to update the user
        const updatedUser = await updateUser(currentUser.id, updatedUserData);

        // If role has changed, update it
        if (userRole !== currentUser.role?.name) {
          await updateUserRole(currentUser.id, userRole);
        }

        // If status has changed, update it
        if (userStatus === "suspended" && !currentUser.isSuspended) {
          await suspendUser(currentUser.id);
        } else if (userStatus !== "suspended" && currentUser.isSuspended) {
          await unsuspendUser(currentUser.id);
        }

        if (userStatus === "banned" && !currentUser.isBanned) {
          if (!banReason) {
            Alert.alert("Error", "A reason is required to ban a user");
            return;
          }
          await banUser(currentUser.id);
          await updateUserStatus(currentUser.id, currentUser.isSuspended, true, banReason);
        } else if (userStatus !== "banned" && currentUser.isBanned) {
          await unbanUser(currentUser.id);
        }

        // Update the user in the local state
        setUsers(
          users.map((u) =>
            u.id === currentUser.id
              ? {
                  ...u,
                  fullname: userName,
                  email: userEmail,
                  role: { name: userRole },
                  isSuspended: userStatus === "suspended",
                  isBanned: userStatus === "banned",
                  banReason: userStatus === "banned" ? banReason : "",
                }
              : u
          )
        );

        Alert.alert("Success", "User updated successfully");
        setModalVisible(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Error", "Failed to update user");
    }
  };

  const fetchUserDetails = async (userId) => {
    setUserDetails((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Fetch purchase history data
      const purchaseHistory = await getPurchaseHistoryByUser(userId);

      // Initialize userDetails with the purchase history data
      setUserDetails({
        purchaseHistory: Array.isArray(purchaseHistory) ? purchaseHistory : [],
        comments: [], // Will be fetched by the UserDetailsModal component itself
        activities: [], // Will be fetched by the UserDetailsModal component itself
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserDetails((prev) => ({
        ...prev,
        purchaseHistory: [],
        loading: false,
        error: "Failed to load user details",
      }));
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailsModalVisible(true);
    fetchUserDetails(user.id);
  };

  const handleDeleteUser = async (userId) => {
    // Confirm before deletion
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this user? This action cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteUser(userId);
            // Remove the user from local state
            setUsers(users.filter((user) => user.id !== userId));
            Alert.alert("Success", "User deleted successfully");
          } catch (error) {
            console.error("Error deleting user:", error);
            Alert.alert("Error", "Failed to delete user");
          }
        },
        style: "destructive",
      },
    ]);
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
        handleDeleteUser={handleDeleteUser}
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
