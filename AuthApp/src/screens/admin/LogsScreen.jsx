import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { getAllLogs } from "../../services/LogServices";

const FilterModal = ({ visible, onClose, onApplyFilters, currentFilters }) => {
  const [selectedTypes, setSelectedTypes] = useState(currentFilters.types || []);
  const [dateFrom, setDateFrom] = useState(currentFilters.dateFrom || "");
  const [dateTo, setDateTo] = useState(currentFilters.dateTo || "");
  const [searchText, setSearchText] = useState(currentFilters.searchText || "");

  const logTypes = [
    { id: "user", label: "User Activity", icon: "person" },
    { id: "book", label: "Book Activity", icon: "book" },
    { id: "purchase", label: "Purchases", icon: "cash" },
    { id: "report", label: "Reports", icon: "warning" },
    { id: "system", label: "System", icon: "information-circle" },
  ];

  const toggleType = (typeId) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter((id) => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setDateFrom("");
    setDateTo("");
    setSearchText("");
  };

  const applyFilters = () => {
    onApplyFilters({
      types: selectedTypes,
      dateFrom,
      dateTo,
      searchText,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter Logs</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalContent}>
            {/* Search Text */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Search Text</Text>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput style={styles.searchInput} placeholder="Search in logs..." value={searchText} onChangeText={setSearchText} />
                {searchText ? (
                  <TouchableOpacity onPress={() => setSearchText("")}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Log Types */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Log Types</Text>
              <View style={styles.logTypesContainer}>
                {logTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.logTypeChip, selectedTypes.includes(type.id) && styles.logTypeChipSelected]}
                    onPress={() => toggleType(type.id)}
                  >
                    <Ionicons name={type.icon} size={16} color={selectedTypes.includes(type.id) ? "#fff" : "#5C6BC0"} />
                    <Text style={[styles.logTypeLabel, selectedTypes.includes(type.id) && styles.logTypeLabelSelected]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.dateRangeContainer}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>From:</Text>
                  <TextInput style={styles.dateInput} placeholder="YYYY-MM-DD" value={dateFrom} onChangeText={setDateFrom} />
                </View>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>To:</Text>
                  <TextInput style={styles.dateInput} placeholder="YYYY-MM-DD" value={dateTo} onChangeText={setDateTo} />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterModalFooter}>
            <TouchableOpacity style={[styles.footerButton, styles.resetButton]} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerButton, styles.applyButton]} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const LogDetailModal = ({ visible, log, onClose }) => {
  if (!log) return null;

  const { action, timestamp, fullLog, icon } = log;

  // Function to get a formatted date string
  const getFormattedDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Function to get severity based on log content
  const getSeverity = (logText) => {
    if (logText.includes("error") || logText.includes("exception") || logText.includes("fail")) {
      return { text: "ERROR", color: "#E53935" };
    } else if (logText.includes("warn")) {
      return { text: "WARNING", color: "#FFB300" };
    } else {
      return { text: "INFO", color: "#43A047" };
    }
  };

  const severity = getSeverity(fullLog.toLowerCase());

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={[styles.logIconContainer, { backgroundColor: "#5C6BC0" }]}>
              <Ionicons name={icon} size={24} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>{action}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.logInfoSection}>
              <View style={styles.logInfoRow}>
                <Text style={styles.logInfoLabel}>Timestamp:</Text>
                <Text style={styles.logInfoValue}>{getFormattedDate(timestamp)}</Text>
              </View>

              <View style={styles.logInfoRow}>
                <Text style={styles.logInfoLabel}>Severity:</Text>
                <View style={[styles.severityBadge, { backgroundColor: severity.color }]}>
                  <Text style={styles.severityText}>{severity.text}</Text>
                </View>
              </View>

              <View style={styles.logInfoRow}>
                <Text style={styles.logInfoLabel}>Type:</Text>
                <Text style={styles.logInfoValue}>{action.replace("New ", "")}</Text>
              </View>
            </View>

            <View style={styles.logContentSection}>
              <Text style={styles.logContentTitle}>Log Message</Text>
              <View style={styles.logMessageContainer}>
                <Text style={styles.logMessage}>{fullLog}</Text>
              </View>
            </View>

            {/* Additional sections could be added here for more details */}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.footerButton, styles.closeModalButton]} onPress={onClose}>
              <Text style={styles.footerButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const LogsScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    dateFrom: "",
    dateTo: "",
    searchText: "",
  });
  const [isFiltered, setIsFiltered] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logsData = await getAllLogs();
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, logs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  // Helper function to parse log entries (reused from AdminDashboardScreen)
  const parseLogEntry = (logEntry) => {
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

      return { action, timeAgo, icon, timestamp, fullLog: logEntry };
    } catch (e) {
      console.error("Error parsing log entry:", e);
      return {
        action: "System activity",
        timeAgo: "Recent",
        icon: "information-circle",
        timestamp: "Unknown",
        fullLog: logEntry,
      };
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];
    const { types, dateFrom, dateTo, searchText } = filters;

    // Filter by log type
    if (types.length > 0) {
      filtered = filtered.filter((log) => {
        const lowercaseLog = log.toLowerCase();
        return types.some((type) => {
          if (type === "system") {
            // System logs are those that don't match other specific types
            return !(
              lowercaseLog.includes("user") ||
              lowercaseLog.includes("book") ||
              lowercaseLog.includes("purchase") ||
              lowercaseLog.includes("report")
            );
          }
          return lowercaseLog.includes(type);
        });
      });
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      filtered = filtered.filter((log) => {
        try {
          const logDate = new Date(log.substring(0, 10));

          if (dateFrom && dateTo) {
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            // Add one day to toDate to include the end date
            toDate.setDate(toDate.getDate() + 1);
            return logDate >= fromDate && logDate < toDate;
          } else if (dateFrom) {
            const fromDate = new Date(dateFrom);
            return logDate >= fromDate;
          } else if (dateTo) {
            const toDate = new Date(dateTo);
            // Add one day to include the end date
            toDate.setDate(toDate.getDate() + 1);
            return logDate < toDate;
          }
          return true;
        } catch (e) {
          return true; // If date parsing fails, include the log
        }
      });
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter((log) => log.toLowerCase().includes(searchText.toLowerCase()));
    }

    setFilteredLogs(filtered);
    setIsFiltered(types.length > 0 || dateFrom || dateTo || searchText);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      dateFrom: "",
      dateTo: "",
      searchText: "",
    });
  };

  const renderItem = ({ item }) => {
    const parsedLog = parseLogEntry(item);
    const { action, timeAgo, icon, fullLog } = parsedLog;

    return (
      <TouchableOpacity
        style={styles.logItem}
        onPress={() => {
          setSelectedLog(parsedLog);
          setDetailModalVisible(true);
        }}
      >
        <View style={styles.logIconContainer}>
          <Ionicons name={icon} size={20} color="#fff" />
        </View>
        <View style={styles.logContent}>
          <Text style={styles.logTitle}>{action}</Text>
          <Text style={styles.logTime}>{timeAgo}</Text>
          <Text style={styles.logDetail} numberOfLines={2}>
            {fullLog}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#BDC3C7" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fc" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#5C6BC0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Logs</Text>
        <View style={styles.headerActions}>
          {isFiltered && (
            <TouchableOpacity onPress={clearFilters} style={styles.actionButton}>
              <Ionicons name="close-circle" size={24} color="#E53935" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.actionButton}>
            <Ionicons name="filter" size={24} color={isFiltered ? "#5C6BC0" : "#666"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRefresh} style={styles.actionButton}>
            <Ionicons name="refresh" size={24} color="#5C6BC0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter status bar */}
      {isFiltered && (
        <View style={styles.filterStatusBar}>
          <Text style={styles.filterStatusText}>{`Filtered: ${filteredLogs.length} of ${logs.length} logs`}</Text>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5C6BC0" />
          <Text style={styles.loadingText}>Loading logs...</Text>
        </View>
      ) : filteredLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#BDC3C7" />
          <Text style={styles.emptyText}>{isFiltered ? "No logs match your filters" : "No logs found"}</Text>
          {isFiltered && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Log Detail Modal */}
      <LogDetailModal visible={detailModalVisible} log={selectedLog} onClose={() => setDetailModalVisible(false)} />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5eb",
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 16,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 16,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 4,
    elevation: 1,
  },
  logIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5C6BC0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  logTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  logDetail: {
    fontSize: 14,
    color: "#888",
  },
  separator: {
    height: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5eb",
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    maxHeight: "70%",
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e1e5eb",
    alignItems: "center",
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  closeModalButton: {
    backgroundColor: "#5C6BC0",
  },
  footerButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  logInfoSection: {
    marginBottom: 20,
  },
  logInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logInfoLabel: {
    width: 100,
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  logInfoValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  severityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  logContentSection: {
    marginBottom: 20,
  },
  logContentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  logMessageContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#5C6BC0",
  },
  logMessage: {
    fontSize: 14,
    color: "#444",
    fontFamily: "monospace",
  },
  // Header action buttons
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },

  // Filter status bar
  filterStatusBar: {
    backgroundColor: "#E3F2FD",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#BBDEFB",
  },
  filterStatusText: {
    color: "#1976D2",
    fontSize: 14,
    textAlign: "center",
  },

  // Empty state with filters
  clearFiltersButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#5C6BC0",
    borderRadius: 4,
  },
  clearFiltersText: {
    color: "white",
    fontWeight: "600",
  },

  // Filter modal
  filterModalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
  },
  filterModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5eb",
  },
  filterModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  filterModalContent: {
    padding: 16,
  },
  filterModalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e1e5eb",
  },

  // Filter sections
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },

  // Log type chips
  logTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  logTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  logTypeChipSelected: {
    backgroundColor: "#5C6BC0",
  },
  logTypeLabel: {
    marginLeft: 4,
    color: "#333",
    fontSize: 14,
  },
  logTypeLabelSelected: {
    color: "#fff",
  },

  // Date range
  dateRangeContainer: {
    marginTop: 8,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateLabel: {
    width: 50,
    fontSize: 14,
    color: "#666",
  },
  dateInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },

  // Footer buttons
  resetButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  resetButtonText: {
    color: "#666",
  },
  applyButton: {
    backgroundColor: "#5C6BC0",
  },
  applyButtonText: {
    color: "#fff",
  },
});

export default LogsScreen;
