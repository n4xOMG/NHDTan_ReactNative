import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getUserCredits, purchaseCredits } from "../services/CreditService";

const CreditsScreen = () => {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const creditPackages = [
    { id: 1, amount: 100, price: 0.99, popular: false },
    { id: 2, amount: 500, price: 4.99, popular: true },
    { id: 3, amount: 1000, price: 9.99, popular: false },
    { id: 4, amount: 2500, price: 19.99, popular: false },
  ];

  useEffect(() => {
    loadUserCredits();
  }, []);

  const loadUserCredits = async () => {
    try {
      setLoading(true);
      const userCredits = await getUserCredits();
      setCredits(userCredits.amount);
    } catch (error) {
      console.error("Error loading credits:", error);
      Alert.alert("Error", "Failed to load credit balance");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (packageId) => {
    const selectedPackage = creditPackages.find((pkg) => pkg.id === packageId);
    Alert.alert("Purchase Credits", `Are you sure you want to purchase ${selectedPackage.amount} credits for $${selectedPackage.price}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Purchase",
        onPress: async () => {
          try {
            setLoading(true);
            await purchaseCredits({ packageId });
            loadUserCredits(); // Refresh credits
            Alert.alert("Success", `Successfully purchased ${selectedPackage.amount} credits!`);
          } catch (error) {
            console.error("Purchase error:", error);
            Alert.alert("Error", "Failed to complete purchase");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <View style={styles.balanceRow}>
          <Icon name="coin" size={30} color="#FFD700" />
          <Text style={styles.balanceAmount}>{credits}</Text>
        </View>
        <Text style={styles.balanceHint}>Use credits to unlock premium chapters</Text>
      </View>

      <Text style={styles.sectionTitle}>Purchase Credits</Text>

      <ScrollView contentContainerStyle={styles.packagesContainer}>
        {creditPackages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[styles.packageCard, pkg.popular && styles.popularPackage]}
            onPress={() => handlePurchase(pkg.id)}
            disabled={loading}
          >
            {pkg.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>BEST VALUE</Text>
              </View>
            )}

            <View style={styles.packageContent}>
              <View style={styles.packageHeader}>
                <Icon name="coin" size={24} color="#FFD700" />
                <Text style={styles.packageAmount}>{pkg.amount}</Text>
              </View>

              <Text style={styles.packagePrice}>${pkg.price}</Text>

              <TouchableOpacity style={styles.buyButton} onPress={() => handlePurchase(pkg.id)} disabled={loading}>
                <Text style={styles.buyButtonText}>BUY</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingBottom: 60, // For bottom navigation
  },
  balanceCard: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginLeft: 10,
  },
  balanceHint: {
    fontSize: 12,
    color: "#888",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 15,
    marginBottom: 5,
  },
  packagesContainer: {
    padding: 10,
  },
  packageCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    position: "relative",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  popularPackage: {
    borderColor: "#2196F3",
    borderWidth: 2,
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 15,
    backgroundColor: "#2196F3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  popularText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  packageContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  packageAmount: {
    fontSize: 22,
    fontWeight: "600",
    marginLeft: 8,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  buyButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CreditsScreen;
