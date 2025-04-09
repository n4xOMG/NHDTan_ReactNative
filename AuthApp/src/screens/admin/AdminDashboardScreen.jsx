import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookCount } from "../../redux/slices/bookSlice";
import { getTotalSalesAmount } from "../../services/PurchaseServices";
import { getReportCount } from "../../services/ReportServices";
import { getUserCount } from "../../services/UserServices";
import { getPaginatedLogs } from "../../services/LogServices";
import { admindashboardstyles } from "../../style/admindashboardstyles";

const AdminDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const { bookCount } = useSelector((state) => state.books);

  useEffect(() => {
    setLoading(true);
    // Fetch the counts and total sales when the component mounts
    const fetchCounts = async () => {
      try {
        dispatch(fetchBookCount());
        const userCountResponse = await getUserCount();
        const reportCountResponse = await getReportCount();
        const totalSalesResponse = await getTotalSalesAmount();
        setUserCount(userCountResponse);
        setReportCount(reportCountResponse);
        setTotalSales(totalSalesResponse);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
      setLoading(false);
    };
    fetchCounts();

    // Fetch logs using the new paginated function
    const getLogs = async () => {
      setLogsLoading(true);
      try {
        // Use getPaginatedLogs with a small page size to get recent logs
        const logsData = await getPaginatedLogs(0, 3);
        if (logsData && Array.isArray(logsData.logs)) {
          setRecentLogs(logsData.logs);
        } else {
          console.warn("Invalid logs data format:", logsData);
          setRecentLogs([]);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
        setRecentLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };
    getLogs();
  }, []);

  // Format the total sales amount as a currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleNavigation = (screen) => {
    switch (screen) {
      case "Users":
        navigation.navigate("UserManagement");
        break;
      case "Books":
        navigation.navigate("BookManagement");
        break;
      case "Reports":
        navigation.navigate("ReportManagement");
        break;
      case "Credits":
        navigation.navigate("CreditPackageManagement");
        break;
      default:
        // Stay on dashboard
        break;
    }
  };

  const StatCard = ({ title, value, icon, colors, isLoading }) => (
    <LinearGradient colors={colors} style={admindashboardstyles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <View style={admindashboardstyles.statIconContainer}>{icon}</View>
      <View style={admindashboardstyles.statContent}>
        {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={admindashboardstyles.statValue}>{value}</Text>}
        <Text style={admindashboardstyles.statTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );

  // Helper function to parse log entries and extract meaningful information
  const parseLogEntry = (logEntry) => {
    if (!logEntry) return defaultLogInfo();

    // This is a simple example. You might need to adjust based on your log format
    try {
      // For string log entries (old format)
      if (typeof logEntry === "string") {
        // Extract timestamp - assuming log starts with a timestamp like "2023-06-15 14:30:45"
        const timestamp = logEntry.substring(0, 19);

        // ...existing string parsing code...

        // Calculate time ago based on timestamp
        return calculateTimeInfo(timestamp, logEntry);
      }

      // For object log entries (new paginated format)
      if (typeof logEntry === "object") {
        let timestamp;
        let message;

        // Try to extract timestamp and message from the object
        if (logEntry.date) {
          timestamp = new Date(logEntry.date);
        } else if (logEntry.timestamp) {
          timestamp = new Date(logEntry.timestamp);
        } else {
          timestamp = new Date(); // Default to current time
        }

        if (logEntry.details) {
          message = logEntry.details;
        } else if (logEntry.message) {
          message = logEntry.message;
        } else {
          message = "System activity"; // Default message
        }

        // Determine action and icon based on type or message content
        let action = logEntry.type || "System activity";
        let icon = determineIcon(action, message);

        // Format timestamp as time ago
        const timeAgo = formatTimeAgo(timestamp);

        return { action, timeAgo, icon };
      }

      return defaultLogInfo();
    } catch (e) {
      console.error("Error parsing log entry:", e);
      return defaultLogInfo();
    }
  };

  const defaultLogInfo = () => ({
    action: "System activity",
    timeAgo: "Recent",
    icon: "information-circle",
  });

  const determineIcon = (action, message) => {
    let icon = "information-circle";
    const lowerAction = action.toLowerCase();
    const lowerMessage = message.toLowerCase();

    if (lowerAction.includes("login") || lowerMessage.includes("login")) {
      icon = "log-in";
    } else if (lowerAction.includes("user") || lowerMessage.includes("user")) {
      icon = "person";
    } else if (lowerAction.includes("book") || lowerMessage.includes("book")) {
      icon = "book";
    } else if (lowerAction.includes("purchase") || lowerMessage.includes("purchase")) {
      icon = "cash";
    } else if (lowerAction.includes("report") || lowerMessage.includes("report")) {
      icon = "warning";
    }

    return icon;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    }
  };

  const calculateTimeInfo = (timestamp, content) => {
    // Extract action based on content
    let action = "System activity";
    if (content.includes("registered")) {
      action = "New user registered";
    } else if (content.includes("book added")) {
      action = "New book added";
    } else if (content.includes("purchase")) {
      action = "New purchase";
    } else if (content.includes("report")) {
      action = "New report submitted";
    }

    // Determine icon
    let icon = determineIcon(action, content);

    // Calculate time ago
    const logTime = new Date(timestamp);
    const timeAgo = formatTimeAgo(logTime);

    return { action, timeAgo, icon };
  };

  return (
    <SafeAreaView style={admindashboardstyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fc" />

      {/* Header */}
      <View style={admindashboardstyles.header}>
        <View>
          <Text style={admindashboardstyles.headerTitle}>Admin Dashboard</Text>
          <Text style={admindashboardstyles.headerSubtitle}>Welcome back, Admin</Text>
        </View>
        <TouchableOpacity style={admindashboardstyles.profileButton}>
          <Ionicons name="person-circle" size={40} color="#5C6BC0" />
        </TouchableOpacity>
      </View>

      <ScrollView style={admindashboardstyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={admindashboardstyles.statsContainer}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => handleNavigation("Users")}>
            <StatCard
              title="Total Users"
              value={userCount.toString()}
              icon={<Ionicons name="people" size={24} color="#fff" />}
              colors={["#5C6BC0", "#3949AB"]}
              isLoading={loading}
            />
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => handleNavigation("Books")}>
            <StatCard
              title="Total Books"
              value={bookCount.toString()}
              icon={<Ionicons name="book" size={24} color="#fff" />}
              colors={["#26C6DA", "#00ACC1"]}
              isLoading={loading}
            />
          </TouchableOpacity>
        </View>

        <View style={admindashboardstyles.statsContainer}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => handleNavigation("Reports")}>
            <StatCard
              title="Reports"
              value={reportCount.toString()}
              icon={<MaterialIcons name="report-problem" size={24} color="#fff" />}
              colors={["#66BB6A", "#43A047"]}
              isLoading={loading}
            />
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => handleNavigation("Credits")}>
            <StatCard
              title="Revenue"
              value={formatCurrency(totalSales)}
              icon={<FontAwesome5 name="dollar-sign" size={24} color="#fff" />}
              colors={["#FFA726", "#FB8C00"]}
              isLoading={loading}
            />
          </TouchableOpacity>
        </View>

        {/* Management Sections */}
        <View style={admindashboardstyles.sectionContainer}>
          <Text style={admindashboardstyles.sectionTitle}>Management</Text>
          <View style={admindashboardstyles.managementGrid}>
            {[
              { title: "User Management", icon: "people", color: "#5C6BC0", screen: "Users" },
              { title: "Book Management", icon: "book", color: "#26C6DA", screen: "Books" },
              { title: "Report Management", icon: "warning", color: "#66BB6A", screen: "Reports" },
              { title: "Credit Packages", icon: "card", color: "#FFA726", screen: "Credits" },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={admindashboardstyles.managementCard} onPress={() => handleNavigation(item.screen)}>
                <View style={[admindashboardstyles.managementIconContainer, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={24} color="#fff" />
                </View>
                <Text style={admindashboardstyles.managementTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={admindashboardstyles.sectionContainer}>
          <View style={admindashboardstyles.sectionHeader}>
            <Text style={admindashboardstyles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate("LogsScreen")}>
              <Text style={admindashboardstyles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={admindashboardstyles.activityList}>
            {logsLoading ? (
              <ActivityIndicator size="small" color="#5C6BC0" style={{ padding: 20 }} />
            ) : recentLogs.length > 0 ? (
              recentLogs.map((log, index) => {
                const { action, timeAgo, icon } = parseLogEntry(log);
                return (
                  <View key={index} style={admindashboardstyles.activityItem}>
                    <View style={admindashboardstyles.activityIconContainer}>
                      <Ionicons name={icon} size={16} color="#fff" />
                    </View>
                    <View style={admindashboardstyles.activityContent}>
                      <Text style={admindashboardstyles.activityTitle}>{action}</Text>
                      <Text style={admindashboardstyles.activityTime}>{timeAgo}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#BDC3C7" />
                  </View>
                );
              })
            ) : (
              <View style={admindashboardstyles.activityItem}>
                <Text style={admindashboardstyles.activityTitle}>No recent activities</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={admindashboardstyles.sectionContainer}>
          <Text style={admindashboardstyles.sectionTitle}>Quick Actions</Text>
          <View style={admindashboardstyles.quickActionsContainer}>
            {[
              { title: "Add User", icon: "person-add", color: "#5C6BC0", screen: "Users" },
              { title: "Add Book", icon: "add-circle", color: "#26C6DA", screen: "Books" },
              { title: "View Reports", icon: "alert-circle", color: "#66BB6A", screen: "Reports" },
              { title: "Edit Credits", icon: "cash", color: "#FFA726", screen: "Credits" },
            ].map((action, index) => (
              <TouchableOpacity key={index} style={admindashboardstyles.quickAction} onPress={() => handleNavigation(action.screen)}>
                <View style={[admindashboardstyles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={20} color="#fff" />
                </View>
                <Text style={admindashboardstyles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;
