import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { getAllReports, resolveReport, deleteReport } from "../../services/ReportServices";

const { width } = Dimensions.get("window");

const ReportManagementScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false); // Initialize as false
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterResolved, setFilterResolved] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role?.name === "ADMIN";

  const reportTypes = [
    { id: "all", label: "All Types", icon: "flag" },
    { id: "book", label: "Books", icon: "book" },
    { id: "chapter", label: "Chapters", icon: "bookmark" },
    { id: "comment", label: "Comments", icon: "message" },
    { id: "user", label: "Users", icon: "user" },
  ];

  // Fetch reports from API
  const fetchReports = useCallback(
    async (refresh = false) => {
      if (loading && !refresh) return;
      if (!hasMore && !refresh) return;

      try {
        setLoading(true);

        if (refresh) {
          setPage(0);
          setHasMore(true);
        }

        const pageToFetch = refresh ? 0 : page;

        // Update filter parameters to match backend expectations
        let typeFilter = filterType !== "all" ? filterType : null;
        // Convert string-based filter to boolean for the backend
        let resolvedFilter = filterResolved !== "all" ? filterResolved === "resolved" : null;

        console.log(`Fetching reports: page=${pageToFetch}, type=${typeFilter}, resolved=${resolvedFilter}`);

        const response = await getAllReports({
          page: pageToFetch,
          size: 20,
          sort: `reportedDate,${sortOrder}`,
          resolved: resolvedFilter,
          type: typeFilter,
        });

        // Ensure we handle the response format correctly (either content array or direct array)
        const newReports = response.content || response || [];

        setReports((prev) => (refresh ? newReports : [...prev, ...newReports]));
        setHasMore(!response.last);

        if (!response.last && !refresh) {
          setPage((prevPage) => prevPage + 1);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        Alert.alert("Error", "Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, hasMore, filterType, filterResolved, sortOrder] // Removed loading, initialLoadDone
  );

  // Initial data loading
  useEffect(() => {
    fetchReports(true); // Fetch immediately on mount
  }, [fetchReports]);

  // Handle filter changes
  useEffect(() => {
    setReports([]);
    setPage(0);
    setHasMore(true);
    fetchReports(true);
  }, [filterType, filterResolved, sortOrder, fetchReports]);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReports(reports);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = reports.filter((report) => {
      if (report.reason && report.reason.toLowerCase().includes(lowercaseQuery)) return true;
      if (report.reporter?.username?.toLowerCase().includes(lowercaseQuery)) return true;
      if (report.book?.title?.toLowerCase().includes(lowercaseQuery)) return true;
      if (report.chapter?.title?.toLowerCase().includes(lowercaseQuery)) return true;
      if (report.comment?.content?.toLowerCase().includes(lowercaseQuery)) return true;
      return false;
    });

    setFilteredReports(filtered);
  }, [reports, searchQuery]);

  const handleViewReport = (report) => {
    setCurrentReport(report);
    setDetailModalVisible(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchReports(false);
    }
  };

  const handleResolveReport = async (id, isResolved) => {
    try {
      setLoading(true);
      await resolveReport(id, isResolved);

      const updatedReports = reports.map((report) => (report.id === id ? { ...report, resolved: isResolved } : report));
      setReports(updatedReports);

      if (currentReport && currentReport.id === id) {
        setCurrentReport({ ...currentReport, resolved: isResolved });
      }

      Alert.alert("Success", `Report has been marked as ${isResolved ? "resolved" : "unresolved"}`);
    } catch (error) {
      console.error(`Error ${isResolved ? "resolving" : "unresolving"} report:`, error);
      Alert.alert("Error", `Failed to update report status. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = (id) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this report? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteReport(id);
            setReports(reports.filter((report) => report.id !== id));

            if (detailModalVisible && currentReport?.id === id) {
              setDetailModalVisible(false);
            }

            Alert.alert("Success", "Report has been deleted");
          } catch (error) {
            console.error("Error deleting report:", error);
            Alert.alert("Error", "Failed to delete report. Please try again.");
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const getReportTypeIcon = (report) => {
    if (report.book) return "book";
    if (report.chapter) return "bookmark";
    if (report.comment) return "message";
    if (report.user) return "user";
    return "flag";
  };

  const getReportTypeLabel = (report) => {
    if (report.book) return "Book";
    if (report.chapter) return "Chapter";
    if (report.comment) return "Comment";
    if (report.user) return "User";
    return "Unknown";
  };

  const getReportTitle = (report) => {
    if (report.book) return report.book.title || "Untitled Book";
    if (report.chapter) return report.chapter.title || "Untitled Chapter";
    if (report.comment) return "Comment Report";
    if (report.user) return report.user.username || "User Report";
    return "Report #" + report.id;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.reportItem, item.resolved && styles.resolvedReportItem]} onPress={() => handleViewReport(item)}>
      <View style={[styles.reportIconContainer, { backgroundColor: item.resolved ? "#e9f7ef" : "#fff3e0" }]}>
        <FontAwesome5 name={getReportTypeIcon(item)} size={22} color={item.resolved ? "#27ae60" : "#f39c12"} />
      </View>

      <View style={styles.reportInfo}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle} numberOfLines={1}>
            {getReportTitle(item)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: item.resolved ? "#e9f7ef" : "#fff3e0" }]}>
            <Text style={[styles.statusText, { color: item.resolved ? "#27ae60" : "#f39c12" }]}>
              {item.resolved ? "Resolved" : "Pending"}
            </Text>
          </View>
        </View>

        <Text style={styles.reportType}>
          <FontAwesome5 name={getReportTypeIcon(item)} size={12} color="#666" /> {getReportTypeLabel(item)}
        </Text>

        <Text style={styles.reportReason} numberOfLines={2}>
          {item.reason || "No reason provided"}
        </Text>

        <View style={styles.reportMeta}>
          <Text style={styles.reporterName}>By: {item.reporter?.username || "Anonymous"}</Text>
          <Text style={styles.reportDate}>{formatDate(item.reportedDate)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.moreButton} onPress={() => handleViewReport(item)}>
        <Ionicons name="chevron-forward" size={24} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
        {reportTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.filterButton, filterType === type.id && styles.activeFilterButton]}
            onPress={() => setFilterType(type.id)}
          >
            <FontAwesome5 name={type.icon} size={14} color={filterType === type.id ? "#fff" : "#666"} style={styles.filterIcon} />
            <Text style={[styles.filterButtonText, filterType === type.id && styles.activeFilterText]}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statusFilterContainer}>
        <TouchableOpacity
          style={[styles.statusFilterButton, filterResolved === "all" && styles.activeStatusFilter]}
          onPress={() => setFilterResolved("all")}
        >
          <Text style={[styles.statusFilterText, filterResolved === "all" && styles.activeStatusFilterText]}>All Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusFilterButton, filterResolved === "pending" && styles.activeStatusFilter]}
          onPress={() => setFilterResolved("pending")}
        >
          <View style={[styles.miniStatusDot, { backgroundColor: "#f39c12" }]} />
          <Text style={[styles.statusFilterText, filterResolved === "pending" && styles.activeStatusFilterText]}>Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusFilterButton, filterResolved === "resolved" && styles.activeStatusFilter]}
          onPress={() => setFilterResolved("resolved")}
        >
          <View style={[styles.miniStatusDot, { backgroundColor: "#27ae60" }]} />
          <Text style={[styles.statusFilterText, filterResolved === "resolved" && styles.activeStatusFilterText]}>Resolved</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDetailModal = () => {
    if (!currentReport) return null;

    return (
      <Modal animationType="slide" transparent={true} visible={detailModalVisible} onRequestClose={() => setDetailModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Report Details</Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  setDetailModalVisible(false);
                  handleDeleteReport(currentReport.id);
                }}
              >
                <Ionicons name="trash-outline" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailScroll}>
              <View style={[styles.reportStatusBanner, { backgroundColor: currentReport.resolved ? "#e9f7ef" : "#fff3e0" }]}>
                <FontAwesome5
                  name={currentReport.resolved ? "check-circle" : "exclamation-circle"}
                  size={20}
                  color={currentReport.resolved ? "#27ae60" : "#f39c12"}
                />
                <Text style={[styles.reportStatusText, { color: currentReport.resolved ? "#27ae60" : "#f39c12" }]}>
                  {currentReport.resolved ? "Resolved" : "Pending Resolution"}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Report Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID:</Text>
                  <Text style={styles.detailValue}>#{currentReport.id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reported:</Text>
                  <Text style={styles.detailValue}>{formatDate(currentReport.reportedDate)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reporter:</Text>
                  <Text style={styles.detailValue}>{currentReport.reporter?.username || "Anonymous"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <View style={styles.typeContainer}>
                    <FontAwesome5 name={getReportTypeIcon(currentReport)} size={14} color="#666" />
                    <Text style={styles.typeText}>{getReportTypeLabel(currentReport)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Reason for Report</Text>
                <View style={styles.reasonContainer}>
                  <Text style={styles.reasonText}>{currentReport.reason || "No reason provided by the reporter."}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Reported Content</Text>

                {currentReport.book && (
                  <View style={styles.reportedContentCard}>
                    <View style={styles.reportedContentHeader}>
                      <FontAwesome5 name="book" size={16} color="#4a80f5" />
                      <Text style={styles.reportedContentType}>Book</Text>
                    </View>

                    <View style={styles.bookContainer}>
                      {currentReport.book.bookCover && (
                        <Image source={{ uri: currentReport.book.bookCover }} style={styles.bookCover} resizeMode="cover" />
                      )}
                      <View style={styles.bookInfo}>
                        <Text style={styles.bookTitle}>{currentReport.book.title || "Untitled Book"}</Text>
                        <Text style={styles.bookAuthor}>
                          by {currentReport.book.authorName || currentReport.book.author?.name || "Unknown Author"}
                        </Text>
                        <TouchableOpacity
                          style={styles.viewButton}
                          onPress={() => {
                            setDetailModalVisible(false);
                            navigation.navigate("BookDetail", { bookId: currentReport.book.id });
                          }}
                        >
                          <Text style={styles.viewButtonText}>View Book</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {currentReport.chapter && (
                  <View style={styles.reportedContentCard}>
                    <View style={styles.reportedContentHeader}>
                      <FontAwesome5 name="bookmark" size={16} color="#4a80f5" />
                      <Text style={styles.reportedContentType}>Chapter</Text>
                    </View>

                    <View style={styles.contentDetailContainer}>
                      <Text style={styles.contentTitle}>{currentReport.chapter.title || "Untitled Chapter"}</Text>
                      {currentReport.chapter.bookTitle && (
                        <Text style={styles.contentSubtitle}>From book: {currentReport.chapter.bookTitle}</Text>
                      )}
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => {
                          setDetailModalVisible(false);
                          navigation.navigate("ReadingScreen", {
                            chapterId: currentReport.chapter.id,
                            bookId: currentReport.chapter.bookId,
                          });
                        }}
                      >
                        <Text style={styles.viewButtonText}>View Chapter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {currentReport.comment && (
                  <View style={styles.reportedContentCard}>
                    <View style={styles.reportedContentHeader}>
                      <FontAwesome5 name="comment" size={16} color="#4a80f5" />
                      <Text style={styles.reportedContentType}>Comment</Text>
                    </View>

                    <View style={styles.contentDetailContainer}>
                      <Text style={styles.commentContent}>"{currentReport.comment.content || "Empty comment"}"</Text>
                      <Text style={styles.commentMeta}>- {currentReport.comment.user?.username || "Unknown user"}</Text>
                      {currentReport.comment.bookTitle && (
                        <Text style={styles.contentSubtitle}>On book: {currentReport.comment.bookTitle}</Text>
                      )}
                      {currentReport.comment.chapterTitle && (
                        <Text style={styles.contentSubtitle}>On chapter: {currentReport.comment.chapterTitle}</Text>
                      )}
                    </View>
                  </View>
                )}

                {!currentReport.book && !currentReport.chapter && !currentReport.comment && (
                  <Text style={styles.noContentText}>No specific content details available</Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.actionButtons}>
              {!currentReport.resolved ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.resolveButton]}
                  onPress={() => handleResolveReport(currentReport.id, true)}
                >
                  <FontAwesome5 name="check-circle" size={16} color="#fff" />
                  <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.unresolveButton]}
                  onPress={() => handleResolveReport(currentReport.id, false)}
                >
                  <FontAwesome5 name="undo" size={16} color="#fff" />
                  <Text style={styles.unresolveButtonText}>Mark as Unresolved</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteReportButton]}
                onPress={() => {
                  setDetailModalVisible(false);
                  handleDeleteReport(currentReport.id);
                }}
              >
                <FontAwesome5 name="trash" size={16} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.unauthorizedContainer}>
        <StatusBar barStyle="dark-content" />
        <MaterialIcons name="lock" size={80} color="#ccc" />
        <Text style={styles.unauthorizedText}>You don't have permission to access this page</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Report Management</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{reports.filter((r) => !r.resolved).length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{reports.filter((r) => r.resolved).length}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by content, reason, or reporter..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {renderFilters()}

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
          <Text style={styles.sortButtonText}>Date {sortOrder === "desc" ? "Newest first" : "Oldest first"}</Text>
          <Ionicons name={sortOrder === "desc" ? "arrow-down" : "arrow-up"} size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {loading && reports.length === 0 ? (
        <ActivityIndicator size="large" color="#4a80f5" style={styles.loader} />
      ) : (
        <FlatList
          data={searchQuery ? filteredReports : reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#4a80f5"]} tintColor="#4a80f5" />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore && !refreshing && reports.length > 0 ? (
              loading ? (
                <ActivityIndicator color="#4a80f5" style={styles.footerLoader} />
              ) : null
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="flag-off-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>{searchQuery ? "No reports match your search" : "No reports found"}</Text>
              </View>
            ) : null
          }
        />
      )}

      {renderDetailModal()}
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
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    backgroundColor: "#fff",
  },
  backBtn: {
    marginRight: 10,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a80f5",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: "#4a80f5",
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "500",
  },
  statusFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statusFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  activeStatusFilter: {
    backgroundColor: "#f0f0f0",
  },
  miniStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusFilterText: {
    fontSize: 13,
    color: "#666",
  },
  activeStatusFilterText: {
    fontWeight: "500",
    color: "#444",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortLabel: {
    fontSize: 15,
    color: "#666",
    marginRight: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  reportItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resolvedReportItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
  },
  reportIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  reportType: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5,
  },
  reportReason: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reporterName: {
    fontSize: 12,
    color: "#888",
  },
  reportDate: {
    fontSize: 12,
    color: "#888",
  },
  moreButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 32,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerLoader: {
    marginVertical: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  detailModalContent: {
    width: "90%",
    height: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  detailScroll: {
    flex: 1,
  },
  reportStatusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginBottom: 16,
  },
  reportStatusText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  detailSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 5,
  },
  reasonContainer: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  reportedContentCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reportedContentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  reportedContentType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4a80f5",
    marginLeft: 8,
  },
  bookContainer: {
    flexDirection: "row",
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 4,
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  contentDetailContainer: {
    padding: 4,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
    marginBottom: 8,
  },
  commentMeta: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: "#4a80f5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  noContentText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    padding: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  resolveButton: {
    backgroundColor: "#27ae60",
  },
  unresolveButton: {
    backgroundColor: "#f39c12",
  },
  deleteReportButton: {
    backgroundColor: "#e74c3c",
  },
  resolveButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
  unresolveButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f9fc",
  },
  unauthorizedText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: "#4a80f5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ReportManagementScreen;
