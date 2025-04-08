import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookCount } from "../../redux/slices/bookSlice";
import { getTotalSalesAmount } from "../../services/PurchaseServices";
import { getReportCount } from "../../services/ReportServices";
import { getUserCount } from "../../services/UserServices";
import { getRecentLogs } from "../../services/LogServices";
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

    // Fetch logs
    const getLogs = async () => {
      setLogsLoading(true);
      try {
        const logs = await getRecentLogs(3);
        setRecentLogs(logs);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
      setLogsLoading(false);
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
    // This is a simple example. You might need to adjust based on your log format
    try {
      // Extract timestamp - assuming log starts with a timestamp like "2023-06-15 14:30:45"
      const timestamp = logEntry.substring(0, 19);

      // Extract action - this is an example, adjust based on your log format
      let action = "System activity";
      if (logEntry.includes("registered")) {
        action = "New user registered";
      } else if (logEntry.includes("book added")) {
        action = "New book added";
      } else if (logEntry.includes("purchase")) {
        action = "New purchase";
      } else if (logEntry.includes("report")) {
        action = "New report submitted";
      }

      // Calculate time ago
      const logTime = new Date(timestamp);
      const now = new Date();
      const diffMs = now - logTime;
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);

      let timeAgo;
      if (diffMins < 60) {
        timeAgo = `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      } else {
        timeAgo = `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
      }

      // Determine the icon based on the action
      let icon = "information-circle";
      if (action.includes("user")) {
        icon = "person-add";
      } else if (action.includes("book")) {
        icon = "book";
      } else if (action.includes("purchase")) {
        icon = "cash";
      } else if (action.includes("report")) {
        icon = "warning";
      }

      return { action, timeAgo, icon };
    } catch (e) {
      console.error("Error parsing log entry:", e);
      return {
        action: "System activity",
        timeAgo: "Recent",
        icon: "information-circle",
      };
    }
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
