import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { useSelector } from "react-redux";
import BookDetail from "../screens/BookDetailScreen";
import ChapterDetailScreen from "../screens/ChapterDetailScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import OtpVerificationScreen from "../screens/OtpVerificationScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import PaymentScreen from "../screens/PaymentScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PostsScreen from "../screens/PostsScreen";
import CategoryBooksScreen from "../screens/CategoryBooksScreen";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import UserManagementScreen from "../screens/admin/UserManagementScreen";
import BookManagementScreen from "../screens/admin/BookManagementScreen";
import ReportManagementScreen from "../screens/admin/ReportManagementScreen";
import CreditPackageManagementScreen from "../screens/admin/CreditPackageManagementScreen";
import LogsScreen from "../screens/admin/LogsScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Login"}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BookDetail" component={BookDetail} options={{ headerShown: false }} />
        <Stack.Screen name="ChapterDetail" component={ChapterDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Posts" component={PostsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CategoryBooks" component={CategoryBooksScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BookManagement" component={BookManagementScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReportManagement" component={ReportManagementScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreditPackageManagement" component={CreditPackageManagementScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LogsScreen" component={LogsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
