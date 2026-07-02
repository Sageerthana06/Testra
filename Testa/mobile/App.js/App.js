import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth
import LoginScreen from './src/screens/auth/LoginScreen';

// Dashboard
import DashboardScreen from './src/screens/dashboard/DashboardScreen';

// Customers (IMPORTANT FIX)
import CustomerListScreen from './src/screens/customers/CustomerListScreen';
import AddCustomerScreen from './src/screens/customers/AddCustomerScreen';

// Others
import SalesScreen from './src/screens/sales/SalesScreen';
import PurchaseScreen from './src/screens/purchases/PurchaseScreen';
import StaffScreen from './src/screens/staff/StaffScreen';
import ReportsScreen from './src/screens/reports/ReportsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">

                {/* AUTH */}
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />

                {/* DASHBOARD */}
                <Stack.Screen
                    name="Dashboard"
                    component={DashboardScreen}
                />

                {/* CUSTOMER (FIXED STRUCTURE) */}
                <Stack.Screen
                    name="Customers"
                    component={CustomerListScreen}
                    options={{ title: 'Customers' }}
                />

                <Stack.Screen
                    name="AddCustomer"
                    component={AddCustomerScreen}
                    options={{ title: 'Add Customer' }}
                />

                {/* SALES */}
                <Stack.Screen
                    name="Sales"
                    component={SalesScreen}
                />

                {/* PURCHASES */}
                <Stack.Screen
                    name="Purchases"
                    component={PurchaseScreen}
                />

                {/* STAFF */}
                <Stack.Screen
                    name="Staff"
                    component={StaffScreen}
                />

                {/* REPORTS */}
                <Stack.Screen
                    name="Reports"
                    component={ReportsScreen}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
}