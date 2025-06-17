import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './Drawernavi';
import CheckoutScreen from './screens/CheckoutScreen';
import CashierScreen from './screens/CashierScreen';
import { CartProvider } from './context/CartContext';
import ProfileScreen from './screens/ProfileScreen';
import ManageScreen from './screens/manageScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import ProductScreen from './screens/ProductScreen';


export type RootStackParamList = {
  Home: undefined;
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
  Cashier: undefined;
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
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={DrawerNavigator} />
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