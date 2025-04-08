import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
// Import existing screens
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
// Import other admin screens...
import LogsScreen from "../screens/admin/LogsScreen";

const Stack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      {/* Other admin screens... */}
      <Stack.Screen name="LogsScreen" component={LogsScreen} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
