import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import SalesSummaryScreen from './screens/SalesReport';
import ProfileScreen from './screens/ProfileScreen'; 
import { Ionicons } from '@expo/vector-icons'; 

// "Manage" has been removed from this list
export type DrawerParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  'Sales Summary': undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          drawerLabel: '👤 Profile',
          drawerIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />
        }} 
      />
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
      <Drawer.Screen 
        name="Sales Summary" 
        component={SalesSummaryScreen} 
        options={{ 
          drawerLabel: '📊 Sales Report',
          drawerIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} />
        }} 
      />
    </Drawer.Navigator>
  );
}