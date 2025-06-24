import React from 'react';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './Drawernavi'; // Removed DrawerParamList from this import
import CheckoutScreen from './screens/CheckoutScreen';
import CashierScreen from './screens/CashierScreen';
import { CartProvider } from './context/CartContext';
import ProfileScreen from './screens/ProfileScreen';
import ManageScreen from './screens/manageScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import ProductScreen from './screens/ProductScreen';

// 1. Define the DrawerParamList here
export type DrawerParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  'Sales Summary': undefined; // Use the name as defined in your Drawer Navigator
};

// This is where the change is applied.
export type RootStackParamList = {
  // 2. Update the type for the nested navigator
  Main: NavigatorScreenParams<DrawerParamList>;
  Cart: undefined;
  Orders: {
    order: {
      total: number;
      items: {
        id: number;
        name: string;
        quantity: number;
        price: number;
      }[];
    };
  };
  Profile: undefined;
  Cashier: {
    transactionId: number | string;
    totalAmount: number;
  };
  Checkout: undefined;
  ManageScreen: undefined;
  CategoriesScreen: undefined;
  ProductScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        {/* This name prop now correctly matches the key in RootStackParamList */}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Cashier" component={CashierScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ManageScreen" component={ManageScreen} />
          <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} />
          <Stack.Screen name="ProductScreen" component={ProductScreen} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}