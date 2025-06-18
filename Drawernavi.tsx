import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import SalesSummaryScreen from './screens/SalesReport'; // 1. Import the sales report screen
import { Ionicons } from '@expo/vector-icons'; // Assuming you use Ionicons

// 2. Define the ParamList for the screens that are ONLY in the Drawer
export type DrawerParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  'Sales Summary': undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          drawerLabel: '🏠 Home',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ 
          drawerLabel: '🛒 Cart',
          drawerIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{ 
          drawerLabel: '📦 Orders',
          drawerIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />
        }} 
      />
      {/* 3. Add the Sales Summary screen to the drawer */}
      <Drawer.Screen 
        name="Sales Summary" 
        component={SalesSummaryScreen} 
        options={{ 
          drawerLabel: '📊 Sales Report',
          drawerIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} />
        }} 
      />
      {/* REMOVED: ProfileScreen and CashierScreen do not belong in the DrawerNavigator.
        They are part of the StackNavigator in App.tsx.
      */}
    </Drawer.Navigator>
  );
}
