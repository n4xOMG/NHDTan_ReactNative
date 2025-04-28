import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { getActiveCreditPackages } from "../services/CreditPackageServices";
import { confirmPayment, createPaymentIntent } from "../services/PaymentService";
import { bookdetailstyles } from "../style/bookdetailstyles";
import { useDispatch } from "react-redux";
import { getProfileFromToken } from "../redux/slices/authSlice";
import { MaterialIcons } from "@expo/vector-icons";

const PaymentScreen = ({ navigation }) => {
  const [creditPackages, setCreditPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const dispatch = useDispatch();
  // Fetch active credit packages
  useEffect(() => {
    const fetchCreditPackages = async () => {
      setLoading(true);
      try {
        const response = await getActiveCreditPackages();
        console.log("Credit packages:", response);
        setCreditPackages(response);
      } catch (error) {
        Alert.alert("Error", "Failed to load credit packages.");
      } finally {
        setLoading(false);
      }
    };
    fetchCreditPackages();
  }, []);

  // Handle payment with Stripe
  const handlePurchase = async (creditPackage) => {
    setLoading(true);
    try {
      // Step 1: Create Payment Intent
      const response = await createPaymentIntent({
        creditPackageId: creditPackage.id,
        currency: "usd", // Adjust as needed
      });

      const { clientSecret } = response;

      // Step 2: Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Book Social",
      });
      if (initError) {
        throw new Error(initError.message);
      }

      // Step 3: Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        throw new Error(presentError.message);
      }

      // Step 4: Confirm Payment
      const confirmResponse = await confirmPayment({
        paymentIntentId: clientSecret.split("_secret_")[0], // Extract PaymentIntent ID
        creditPackageId: creditPackage.id,
      });

      if (confirmResponse.message) {
        dispatch(getProfileFromToken()); // Refresh user credits
        Alert.alert("Success", "Payment successful! Credits added.");
        navigation.goBack(); // Or refresh user credits
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderCreditPackage = ({ item }) => {
    const isSelected = selectedPackage?.id === item.id;

    return (
      <TouchableOpacity style={[styles.packageCard, isSelected && styles.selectedCard]} onPress={() => setSelectedPackage(item)}>
        <View style={styles.packageHeader}>
          <Text style={styles.packageName}>{item.name}</Text>
          {isSelected && <MaterialIcons name="check-circle" size={24} color="#2196F3" />}
        </View>

        <View style={styles.packageContent}>
          <View style={styles.creditBadge}>
            <Text style={styles.creditAmount}>{item.creditAmount}</Text>
            <Text style={styles.creditLabel}>Credits</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </View>
        </View>

        {isSelected && <View style={styles.selectedIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}>
      <View style={[bookdetailstyles.container, styles.container]}>
        {loading ? (
          <View style={bookdetailstyles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={bookdetailstyles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <Text style={[bookdetailstyles.sectionTitle, styles.pageTitle]}>Purchase Credits</Text>
            <Text style={styles.subtitle}>Select a credit package to enhance your reading experience</Text>

            <FlatList
              data={creditPackages}
              renderItem={renderCreditPackage}
              keyExtractor={(item) => item.id.toString()}
              style={styles.packageList}
              contentContainerStyle={styles.listContent}
            />

            {selectedPackage && (
              <TouchableOpacity
                style={[bookdetailstyles.postButton, styles.purchaseButton]}
                onPress={() => handlePurchase(selectedPackage)}
                disabled={loading}
              >
                <Text style={styles.purchaseButtonText}>
                  Purchase {selectedPackage.creditAmount} Credits for ${selectedPackage.price.toFixed(2)}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  packageList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  packageCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  selectedCard: {
    borderColor: "#2196F3",
    borderWidth: 2,
    backgroundColor: "#f0f8ff",
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  packageName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  packageContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditBadge: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    minWidth: 100,
  },
  creditAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196F3",
  },
  creditLabel: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  selectedIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#2196F3",
  },
  purchaseButton: {
    backgroundColor: "#2196F3",
    marginTop: 20,
    borderRadius: 10,
    paddingVertical: 14,
  },
  purchaseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default PaymentScreen;
