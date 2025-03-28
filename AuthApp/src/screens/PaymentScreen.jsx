import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { getActiveCreditPackages } from "../services/CreditPackageServices";
import { confirmPayment, createPaymentIntent } from "../services/PaymentService";
import { bookdetailstyles } from "../style/bookdetailstyles";
import { useDispatch } from "react-redux";
import { getProfileFromToken } from "../redux/slices/authSlice";

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

  const renderCreditPackage = ({ item }) => (
    <TouchableOpacity
      style={[bookdetailstyles.card, selectedPackage?.id === item.id && { borderColor: "#2196F3", borderWidth: 2 }]}
      onPress={() => setSelectedPackage(item)}
    >
      <Text style={bookdetailstyles.title}>{item.name}</Text>
      <Text style={bookdetailstyles.author}>{item.creditAmount} Credits</Text>
      <Text style={bookdetailstyles.category}>${item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}>
      <View style={bookdetailstyles.container}>
        {loading ? (
          <View style={bookdetailstyles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={bookdetailstyles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <Text style={bookdetailstyles.sectionTitle}>Purchase Credits</Text>
            <FlatList
              data={creditPackages}
              renderItem={renderCreditPackage}
              keyExtractor={(item) => item.id.toString()}
              style={bookdetailstyles.chapterList}
            />
            {selectedPackage && (
              <TouchableOpacity style={bookdetailstyles.postButton} onPress={() => handlePurchase(selectedPackage)} disabled={loading}>
                <Text style={bookdetailstyles.postButtonText}>
                  Buy {selectedPackage.creditAmount} Credits for ${selectedPackage.price.toFixed(2)}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </StripeProvider>
  );
};

export default PaymentScreen;
