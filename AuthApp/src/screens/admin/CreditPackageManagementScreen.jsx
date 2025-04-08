import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAllCreditPackages,
  createCreditPackage,
  updateCreditPackage,
  deleteCreditPackage,
  toggleCreditPackageStatus,
} from "../../services/CreditPackageServices";
import { creditmanagestyles } from "../../style/creditmanagestyles";

// Import components
import CreditPackageItem from "../../components/creditPackage/CreditPackageItem";
import SearchBar from "../../components/creditPackage/SearchBar";
import StatusFilter from "../../components/creditPackage/StatusFilter";
import SortHeader from "../../components/creditPackage/SortHeader";
import PackageFormModal from "../../components/creditPackage/PackageFormModal";
import Stats from "../../components/creditPackage/Stats";
import EmptyList from "../../components/creditPackage/EmptyList";
import ErrorDisplay from "../../components/creditPackage/ErrorDisplay";

// Default icons for packages that don't have one specified
const DEFAULT_ICONS = ["🪙", "💰", "💎", "📚", "🎁", "🎯", "🚀", "⭐", "👨‍👩‍👧‍👦", "📱"];

const CreditPackageManagementScreen = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("name");
  const [filterActive, setFilterActive] = useState("all");
  const [error, setError] = useState(null);

  // For the edit/add modal
  const [packageName, setPackageName] = useState("");
  const [packageCredits, setPackageCredits] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageDuration, setPackageDuration] = useState("");
  const [packageIcon, setPackageIcon] = useState("🪙");
  const [packageIsPopular, setPackageIsPopular] = useState(false);
  const [packageIsActive, setPackageIsActive] = useState(true);

  // Predefined icons for selection
  const iconOptions = ["🪙", "💰", "💎", "📚", "🎁", "🎯", "🚀", "⭐", "👨‍👩‍👧‍👦", "📱"];

  // Fetch credit packages from API
  const fetchCreditPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCreditPackages();

      // Transform backend DTO to frontend model
      const transformedPackages = data.map((pkg, index) => ({
        id: pkg.id.toString(),
        name: pkg.name,
        credits: pkg.creditAmount,
        price: pkg.price,
        description: pkg.description || "No description available",
        isPopular: pkg.isPopular || false,
        // Fix: Use isActive instead of active to match the DTO property
        isActive: pkg.isActive || pkg.active,
        duration: pkg.duration || 30,
        icon: pkg.icon || DEFAULT_ICONS[index % DEFAULT_ICONS.length],
      }));

      setPackages(transformedPackages);
    } catch (err) {
      console.error("Failed to fetch credit packages", err);
      setError("Failed to load credit packages. Please try again.");
      // Fallback to mock data in case of error (can be removed in production)
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditPackages();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...packages];

    // Filter by active status
    if (filterActive !== "all") {
      const activeStatus = filterActive === "active";
      // Fix: Use isActive instead of active
      result = result.filter((pkg) => pkg.isActive === activeStatus);
    }

    // Search query
    if (searchQuery) {
      result = result.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (pkg.description && pkg.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sort
    result.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortBy === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortBy === "credits") {
        return sortOrder === "asc" ? a.credits - b.credits : b.credits - a.credits;
      }
      return 0;
    });

    setFilteredPackages(result);
  }, [searchQuery, packages, sortOrder, sortBy, filterActive]);

  const handleSort = (key) => {
    const newSortOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortOrder(newSortOrder);
  };

  const handleEdit = (pkg) => {
    setCurrentPackage(pkg);
    setPackageName(pkg.name);
    setPackageCredits(pkg.credits.toString());
    setPackagePrice(pkg.price.toString());
    setPackageDescription(pkg.description || "");
    setPackageDuration(pkg.duration ? pkg.duration.toString() : "30");
    setPackageIcon(pkg.icon || "🪙");
    setPackageIsPopular(pkg.isPopular || false);
    // Fix: Use isActive instead of active
    setPackageIsActive(pkg.isActive);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setCurrentPackage(null);
    setPackageName("");
    setPackageCredits("");
    setPackagePrice("");
    setPackageDescription("");
    setPackageDuration("30");
    setPackageIcon("🪙");
    setPackageIsPopular(false);
    setPackageIsActive(true);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this credit package?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteCreditPackage(id);
            setPackages(packages.filter((pkg) => pkg.id !== id));
            Alert.alert("Success", "Package deleted successfully");
          } catch (err) {
            console.error("Failed to delete package", err);
            Alert.alert("Error", "Failed to delete package. Please try again.");
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = !currentStatus;
      await toggleCreditPackageStatus(id, newStatus);

      // Fix: Update isActive property instead of active
      setPackages(packages.map((pkg) => (pkg.id === id ? { ...pkg, isActive: newStatus } : pkg)));
    } catch (err) {
      console.error("Failed to toggle package status", err);
      Alert.alert("Error", "Failed to update package status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePopular = (id, currentStatus) => {
    const newStatus = !currentStatus;
    setPackages(packages.map((pkg) => (pkg.id === id ? { ...pkg, isPopular: newStatus } : pkg)));
  };

  const handleSave = async () => {
    if (!packageName || !packageCredits || !packagePrice) {
      Alert.alert("Error", "Name, credits, and price are required");
      return;
    }

    // Validate numeric fields
    if (isNaN(Number(packageCredits)) || isNaN(Number(packagePrice)) || (packageDuration && isNaN(Number(packageDuration)))) {
      Alert.alert("Error", "Credits, price, and duration must be valid numbers");
      return;
    }

    try {
      setLoading(true);

      // Create package object that matches backend expectations
      const packageData = {
        name: packageName,
        creditAmount: parseInt(packageCredits),
        price: parseFloat(packagePrice),
        description: packageDescription,
        duration: packageDuration ? parseInt(packageDuration) : 30,
        icon: packageIcon,
        isPopular: packageIsPopular,
        // Fix: Use isActive to match the DTO property
        isActive: packageIsActive,
      };

      let response;

      if (currentPackage) {
        // Edit existing package
        response = await updateCreditPackage(currentPackage.id, packageData);

        // Update local state
        setPackages(
          packages.map((pkg) =>
            pkg.id === currentPackage.id
              ? {
                  ...pkg,
                  name: packageName,
                  credits: parseInt(packageCredits),
                  price: parseFloat(packagePrice),
                  description: packageDescription,
                  duration: packageDuration ? parseInt(packageDuration) : pkg.duration,
                  icon: packageIcon,
                  isPopular: packageIsPopular,
                  // Fix: Use isActive instead of active
                  isActive: packageIsActive,
                }
              : pkg
          )
        );

        Alert.alert("Success", "Package updated successfully");
      } else {
        // Add new package
        response = await createCreditPackage(packageData);

        // Add to local state with response data (including ID from server)
        const newPackage = {
          id: response.id.toString(),
          name: packageName,
          credits: parseInt(packageCredits),
          price: parseFloat(packagePrice),
          description: packageDescription,
          duration: packageDuration ? parseInt(packageDuration) : 30,
          icon: packageIcon,
          isPopular: packageIsPopular,
          // Fix: Use isActive instead of active
          isActive: packageIsActive,
        };

        setPackages([...packages, newPackage]);
        Alert.alert("Success", "New package created successfully");
      }

      setModalVisible(false);
    } catch (err) {
      console.error("Failed to save package", err);
      Alert.alert("Error", "Failed to save package. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={creditmanagestyles.container}>
      <StatusBar barStyle="dark-content" />

      <Stats packages={packages} />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <StatusFilter filterActive={filterActive} setFilterActive={setFilterActive} />
      <SortHeader sortBy={sortBy} sortOrder={sortOrder} handleSort={handleSort} />

      {loading ? (
        <ActivityIndicator size="large" color="#4a80f5" style={creditmanagestyles.loader} />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={fetchCreditPackages} />
      ) : (
        <>
          <FlatList
            data={filteredPackages}
            renderItem={({ item }) => (
              <CreditPackageItem
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onTogglePopular={handleTogglePopular}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={creditmanagestyles.listContainer}
            ListEmptyComponent={<EmptyList />}
          />

          <TouchableOpacity style={creditmanagestyles.addButton} onPress={handleAdd}>
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        </>
      )}

      <PackageFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        currentPackage={currentPackage}
        packageName={packageName}
        setPackageName={setPackageName}
        packageCredits={packageCredits}
        setPackageCredits={setPackageCredits}
        packagePrice={packagePrice}
        setPackagePrice={setPackagePrice}
        packageDescription={packageDescription}
        setPackageDescription={setPackageDescription}
        packageDuration={packageDuration}
        setPackageDuration={setPackageDuration}
        packageIcon={packageIcon}
        setPackageIcon={setPackageIcon}
        packageIsPopular={packageIsPopular}
        setPackageIsPopular={setPackageIsPopular}
        packageIsActive={packageIsActive}
        setPackageIsActive={setPackageIsActive}
        iconOptions={iconOptions}
      />
    </SafeAreaView>
  );
};

export default CreditPackageManagementScreen;
