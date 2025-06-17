import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProfileScreen from './screens/ProfileScreen';
import CashierScreen from './screens/CashierScreen'; 
import { DrawerParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ drawerLabel: '👤 Profile' }} />
      <Drawer.Screen name="Home" component={HomeScreen} options={{ drawerLabel: '🏠 Home' }} />
      <Drawer.Screen name="Cart" component={CartScreen} options={{ drawerLabel: '🛒 Cart' }} />
      <Drawer.Screen name="Orders" component={OrdersScreen} options={{ drawerLabel: '📦 Orders' }} />
      <Drawer.Screen name="Cashier" component={CashierScreen} options={{ drawerLabel: '💰 Cashier' }} />
    </Drawer.Navigator>
  );
}