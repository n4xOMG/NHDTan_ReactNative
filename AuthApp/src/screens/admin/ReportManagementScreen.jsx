import React, { useState, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';

// Mock data - replace with actual API calls
const MOCK_REPORTS = [
  {
    id: '1',
    title: 'Monthly Revenue',
    type: 'financial',
    period: 'Jun 2023',
    status: 'approved',
    data: {
      total: 12580.50,
      change: 15.3, // percentage compared to previous period
      breakdown: [
        { category: 'Basic Package', value: 2150.25 },
        { category: 'Premium Package', value: 6740.80 },
        { category: 'Gold Package', value: 3689.45 },
      ]
    },
    generatedDate: '2023-07-01',
    approvedBy: 'admin',
  },
  {
    id: '2',
    title: 'New Users',
    type: 'users',
    period: 'Jun 2023',
    status: 'pending',
    data: {
      total: 245,
      change: 8.2,
      breakdown: [
        { category: 'Mobile App', value: 175 },
        { category: 'Website', value: 70 },
      ]
    },
    generatedDate: '2023-07-01',
    approvedBy: null,
  },
  {
    id: '3',
    title: 'Book Popularity',
    type: 'content',
    period: 'Q2 2023',
    status: 'approved',
    data: {
      total: 5678,
      change: 22.7,
      breakdown: [
        { category: 'Fiction', value: 2345 },
        { category: 'Non-Fiction', value: 1236 },
        { category: 'Educational', value: 1105 },
        { category: 'Others', value: 992 },
      ]
    },
    generatedDate: '2023-07-03',
    approvedBy: 'admin',
  },
  {
    id: '4',
    title: 'User Engagement',
    type: 'analytics',
    period: 'Jun 2023',
    status: 'rejected',
    data: {
      total: 45280,
      change: -2.3,
      breakdown: [
        { category: 'Reading Time', value: 32450 },
        { category: 'Searches', value: 8760 },
        { category: 'Ratings & Reviews', value: 4070 },
      ]
    },
    generatedDate: '2023-07-02',
    approvedBy: null,
  },
  {
    id: '5',
    title: 'Quarterly Summary',
    type: 'summary',
    period: 'Q2 2023',
    status: 'approved',
    data: {
      total: null,
      change: null,
      breakdown: []
    },
    generatedDate: '2023-07-05',
    approvedBy: 'admin',
  },
];

const { width } = Dimensions.get('window');

const ReportManagementScreen = () => {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [filteredReports, setFilteredReports] = useState(MOCK_REPORTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // newest first
  const [generateModalVisible, setGenerateModalVisible] = useState(false);

  // For the generate modal
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('financial');
  const [reportPeriod, setReportPeriod] = useState('');

  // Report types for filters and generation
  const reportTypes = [
    { id: 'financial', label: 'Financial', icon: 'dollar-sign' },
    { id: 'users', label: 'Users', icon: 'users' },
    { id: 'content', label: 'Content', icon: 'book' },
    { id: 'analytics', label: 'Analytics', icon: 'chart-bar' },
    { id: 'summary', label: 'Summary', icon: 'clipboard-list' },
  ];

  useEffect(() => {
    // Apply filters and search
    let result = [...reports];
    
    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(report => report.type === filterType);
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(report => report.status === filterStatus);
    }
    
    // Search query
    if (searchQuery) {
      result = result.filter(
        report =>
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.period.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.generatedDate);
      const dateB = new Date(b.generatedDate);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredReports(result);
  }, [searchQuery, reports, filterType, filterStatus, sortOrder]);

  const handleViewReport = (report) => {
    setCurrentReport(report);
    setDetailModalVisible(true);
  };

  const handleGenerateReport = () => {
    setGenerateModalVisible(true);
  };

  const handleCreateReport = () => {
    if (!reportTitle || !reportPeriod) {
      Alert.alert('Error', 'Title and period are required');
      return;
    }

    // In a real app, this would be an API call to generate a report
    // Here we just mock the creation
    const newReport = {
      id: Date.now().toString(),
      title: reportTitle,
      type: reportType,
      period: reportPeriod,
      status: 'pending',
      data: {
        total: 0,
        change: 0,
        breakdown: [],
      },
      generatedDate: new Date().toISOString().split('T')[0],
      approvedBy: null,
    };

    setReports([newReport, ...reports]);
    setGenerateModalVisible(false);
    
    // Reset form
    setReportTitle('');
    setReportType('financial');
    setReportPeriod('');

    Alert.alert('Success', 'Report generation initiated. It will be available soon.');
  };

  const handleDeleteReport = (id) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this report?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            setReports(reports.filter(report => report.id !== id));
            if (detailModalVisible && currentReport && currentReport.id === id) {
              setDetailModalVisible(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleApproveReport = (id) => {
    const updatedReports = reports.map(report => 
      report.id === id 
        ? { 
            ...report, 
            status: 'approved', 
            approvedBy: 'admin' // In real app, use logged in admin ID
          } 
        : report
    );
    setReports(updatedReports);
    
    if (currentReport && currentReport.id === id) {
      setCurrentReport({ ...currentReport, status: 'approved', approvedBy: 'admin' });
    }
    
    Alert.alert('Success', 'Report has been approved');
  };

  const handleRejectReport = (id) => {
    const updatedReports = reports.map(report => 
      report.id === id 
        ? { 
            ...report, 
            status: 'rejected', 
          } 
        : report
    );
    setReports(updatedReports);
    
    if (currentReport && currentReport.id === id) {
      setCurrentReport({ ...currentReport, status: 'rejected' });
    }
    
    Alert.alert('Success', 'Report has been rejected');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#00cc66';
      case 'pending': return '#ffc107';
      case 'rejected': return '#f44336';
      default: return '#666';
    }
  };

  const getTypeIcon = (type) => {
    const reportType = reportTypes.find(t => t.id === type);
    return reportType ? reportType.icon : 'file-alt';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value, suffix = '') => {
    return `${value.toLocaleString()}${suffix}`;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.reportItem} onPress={() => handleViewReport(item)}>
      <View style={styles.reportIconContainer}>
        <FontAwesome5 
          name={getTypeIcon(item.type)} 
          size={24} 
          color="#4a80f5" 
          style={styles.reportIcon} 
        />
      </View>
      
      <View style={styles.reportInfo}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportPeriod}>{item.period}</Text>
        
        <View style={styles.reportMeta}>
          <Text style={styles.generatedDate}>
            Generated: {formatDate(item.generatedDate)}
          </Text>
          
          <View style={[
            styles.statusBadge, 
            { backgroundColor: `${getStatusColor(item.status)}20` }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) }
            ]} />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.moreButton}
        onPress={() => handleViewReport(item)}
      >
        <Ionicons name="chevron-forward" size={24} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        <TouchableOpacity 
          style={[styles.filterButton, filterType === 'all' && styles.activeFilterButton]} 
          onPress={() => setFilterType('all')}
        >
          <FontAwesome5 
            name="layer-group" 
            size={14} 
            color={filterType === 'all' ? "#fff" : "#666"} 
            style={styles.filterIcon}
          />
          <Text style={[styles.filterButtonText, filterType === 'all' && styles.activeFilterText]}>
            All Types
          </Text>
        </TouchableOpacity>
        
        {reportTypes.map(type => (
          <TouchableOpacity 
            key={type.id}
            style={[styles.filterButton, filterType === type.id && styles.activeFilterButton]} 
            onPress={() => setFilterType(type.id)}
          >
            <FontAwesome5 
              name={type.icon} 
              size={14} 
              color={filterType === type.id ? "#fff" : "#666"} 
              style={styles.filterIcon}
            />
            <Text style={[styles.filterButtonText, filterType === type.id && styles.activeFilterText]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.statusFilterContainer}>
        <TouchableOpacity 
          style={[styles.statusFilterButton, filterStatus === 'all' && styles.activeStatusFilter]} 
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.statusFilterText, filterStatus === 'all' && styles.activeStatusFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statusFilterButton, filterStatus === 'pending' && styles.activeStatusFilter]} 
          onPress={() => setFilterStatus('pending')}
        >
          <View style={[styles.miniStatusDot, { backgroundColor: '#ffc107' }]} />
          <Text style={[styles.statusFilterText, filterStatus === 'pending' && styles.activeStatusFilterText]}>
            Pending
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statusFilterButton, filterStatus === 'approved' && styles.activeStatusFilter]} 
          onPress={() => setFilterStatus('approved')}
        >
          <View style={[styles.miniStatusDot, { backgroundColor: '#00cc66' }]} />
          <Text style={[styles.statusFilterText, filterStatus === 'approved' && styles.activeStatusFilterText]}>
            Approved
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statusFilterButton, filterStatus === 'rejected' && styles.activeStatusFilter]} 
          onPress={() => setFilterStatus('rejected')}
        >
          <View style={[styles.miniStatusDot, { backgroundColor: '#f44336' }]} />
          <Text style={[styles.statusFilterText, filterStatus === 'rejected' && styles.activeStatusFilterText]}>
            Rejected
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDetailModal = () => {
    if (!currentReport) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setDetailModalVisible(false)}
              >
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
                <Ionicons name="trash-outline" size={24} color="#f44336" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.detailScroll}>
              <View style={styles.reportHeader}>
                <View style={styles.reportTypeIndicator}>
                  <FontAwesome5 
                    name={getTypeIcon(currentReport.type)} 
                    size={24} 
                    color="#fff" 
                  />
                </View>
                
                <View style={styles.reportHeaderInfo}>
                  <Text style={styles.detailTitle}>{currentReport.title}</Text>
                  <Text style={styles.detailPeriod}>{currentReport.period}</Text>
                </View>
              </View>
              
              <View style={styles.reportMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Generated:</Text>
                  <Text style={styles.metaValue}>{formatDate(currentReport.generatedDate)}</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Status:</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: `${getStatusColor(currentReport.status)}20` }
                  ]}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(currentReport.status) }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(currentReport.status) }
                    ]}>
                      {currentReport.status.charAt(0).toUpperCase() + currentReport.status.slice(1)}
                    </Text>
                  </View>
                </View>
                
                {currentReport.approvedBy && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Approved By:</Text>
                    <Text style={styles.metaValue}>{currentReport.approvedBy}</Text>
                  </View>
                )}
              </View>
              
              {currentReport.data && currentReport.data.total !== null && (
                <View style={styles.reportCard}>
                  <Text style={styles.cardTitle}>Overview</Text>
                  
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalValue}>
                      {currentReport.type === 'financial' 
                        ? formatCurrency(currentReport.data.total)
                        : formatNumber(currentReport.data.total)}
                    </Text>
                    
                    {currentReport.data.change !== null && (
                      <View style={[
                        styles.changeBadge,
                        {
                          backgroundColor: currentReport.data.change >= 0
                            ? '#e6f7ee'
                            : '#ffe6e6'
                        }
                      ]}>
                        <AntDesign 
                          name={currentReport.data.change >= 0 ? 'arrowup' : 'arrowdown'} 
                          size={12} 
                          color={currentReport.data.change >= 0 ? '#00cc66' : '#f44336'} 
                        />
                        <Text style={[
                          styles.changeText,
                          {
                            color: currentReport.data.change >= 0
                              ? '#00cc66'
                              : '#f44336'
                          }
                        ]}>
                          {Math.abs(currentReport.data.change).toFixed(1)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              
              {currentReport.data && currentReport.data.breakdown && 
               currentReport.data.breakdown.length > 0 && (
                <View style={styles.reportCard}>
                  <Text style={styles.cardTitle}>Breakdown</Text>
                  
                  {currentReport.data.breakdown.map((item, index) => (
                    <View key={index} style={styles.breakdownItem}>
                      <Text style={styles.breakdownCategory}>{item.category}</Text>
                      <Text style={styles.breakdownValue}>
                        {currentReport.type === 'financial' 
                          ? formatCurrency(item.value)
                          : formatNumber(item.value)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            
            {currentReport.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleRejectReport(currentReport.id)}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApproveReport(currentReport.id)}
                >
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderGenerateModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={generateModalVisible}
      onRequestClose={() => setGenerateModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Generate New Report</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Title</Text>
            <TextInput
              style={styles.textInput}
              value={reportTitle}
              onChangeText={setReportTitle}
              placeholder="e.g. Monthly Revenue"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Type</Text>
            <View style={styles.reportTypeSelector}>
              {reportTypes.map(type => (
                <TouchableOpacity 
                  key={type.id}
                  style={[
                    styles.reportTypeOption,
                    reportType === type.id && styles.selectedReportType
                  ]}
                  onPress={() => setReportType(type.id)}
                >
                  <FontAwesome5 
                    name={type.icon} 
                    size={16} 
                    color={reportType === type.id ? "#4a80f5" : "#888"} 
                    style={styles.reportTypeIcon}
                  />
                  <Text style={[
                    styles.reportTypeText,
                    reportType === type.id && styles.selectedReportTypeText
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Period</Text>
            <TextInput
              style={styles.textInput}
              value={reportPeriod}
              onChangeText={setReportPeriod}
              placeholder="e.g. Jul 2023 or Q3 2023"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setGenerateModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.generateButton]}
              onPress={handleCreateReport}
            >
              <Text style={styles.generateButtonText}>Generate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Report Management</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reports.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {reports.filter(r => r.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {reports.filter(r => r.status === 'approved').length}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports by title or period..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {renderFilters()}
      
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity 
          style={styles.sortButton} 
          onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        >
          <Text style={styles.sortButtonText}>
            Date {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          </Text>
          <Ionicons 
            name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} 
            size={16} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#4a80f5" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="file-alt" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No reports found</Text>
            </View>
          }
        />
      )}
      
      <TouchableOpacity style={styles.addButton} onPress={handleGenerateReport}>
        <FontAwesome5 name="file-medical" size={22} color="white" />
      </TouchableOpacity>
      
      {renderDetailModal()}
      {renderGenerateModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  titleContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    marginRight: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a80f5',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
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
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#4a80f5',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  statusFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  activeStatusFilter: {
    backgroundColor: '#f0f0f0',
  },
  miniStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusFilterText: {
    fontSize: 13,
    color: '#666',
  },
  activeStatusFilterText: {
    fontWeight: '500',
    color: '#444',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortLabel: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  reportItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reportIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportIcon: {
    opacity: 0.8,
  },
  reportInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reportPeriod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  generatedDate: {
    fontSize: 12,
    color: '#888',
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a80f5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailModalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  detailScroll: {
    flex: 1,
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportTypeIndicator: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a80f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportHeaderInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailPeriod: {
    fontSize: 16,
    color: '#666',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  metaValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  breakdownCategory: {
    fontSize: 14,
    color: '#555',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  approveButton: {
    backgroundColor: '#4a80f5',
  },
  rejectButtonText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '500',
  },
  approveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  reportTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  reportTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
    width: (width * 0.9 - 64) / 2,
  },
  selectedReportType: {
    backgroundColor: '#e0eaff',
    borderWidth: 1,
    borderColor: '#4a80f5',
  },
  reportTypeIcon: {
    marginRight: 8,
  },
  reportTypeText: {
    fontSize: 14,
    color: '#666',
  },
  selectedReportTypeText: {
    color: '#4a80f5',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  generateButton: {
    backgroundColor: '#4a80f5',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#555',
  },
  generateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default ReportManagementScreen;