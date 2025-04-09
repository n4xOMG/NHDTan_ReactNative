import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { getPurchaseHistory } from "../../services/PurchaseServices";

const PurchasesTab = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseHistory();
      setPurchases(data);
    } catch (err) {
      setError("Failed to load purchase history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (purchases.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyStateText}>No purchase history yet.</Text>
      </View>
    );
  }

  const renderPurchaseItem = ({ item }) => (
    <View style={styles.purchaseItem}>
      <Text style={styles.purchaseTitle}>{item.creditPackage.name}</Text>
      <View style={styles.purchaseDetails}>
        <Text style={styles.purchaseDate}>{new Date(item.purchaseDate).toLocaleDateString()}</Text>
        <Text style={styles.purchaseAmount}>${item.amount.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={purchases}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPurchaseItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
  },
  listContent: {
    padding: 15,
  },
  purchaseItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  purchaseTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  purchaseDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  purchaseDate: {
    color: "#888",
    fontSize: 14,
  },
  purchaseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2196F3",
  },
});

export default PurchasesTab;
