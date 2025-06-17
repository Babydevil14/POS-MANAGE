import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function ProfileScreen() {
  const adminName = 'Admin';
  const navigation = useNavigation();
  const [showProductOptions, setShowProductOptions] = useState(false);

  const menuItems = [
    {
      title: 'Manage Products',
      icon: <Ionicons name="cube-outline" size={22} color="#009e60" />,
    },
    {
      title: 'Order History',
      icon: <MaterialIcons name="history" size={22} color="#009e60" />,
      route: 'Orders',
    },
    {
      title: 'Sales Report',
      icon: <FontAwesome5 name="chart-line" size={20} color="#009e60" />,
      route: 'SalesReport',
    },
    {
      title: 'Settings',
      icon: <Ionicons name="settings-outline" size={22} color="#009e60" />,
      route: 'Settings',
    },
    {
      title: 'Logout',
      icon: <MaterialIcons name="logout" size={22} color="red" />,
      isLogout: true,
    },
  ];

  const handleNavigation = (title: string, route?: string) => {
    if (title === 'Manage Products') {
      setShowProductOptions(!showProductOptions);
    } else if (title === 'Logout') {
      console.log('Logging out...');
    } else if (route) {
      navigation.navigate(route as never);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>👋 Welcome, {adminName}</Text>

      <View style={styles.menuList}>
        {menuItems.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              style={[styles.menuItem, item.isLogout && { borderColor: 'red' }]}
              onPress={() => handleNavigation(item.title, item.route)}
            >
              <View style={styles.icon}>{item.icon}</View>
              <Text
                style={[
                  styles.menuText,
                  item.isLogout && { color: 'red', fontWeight: 'bold' },
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>

            {/* Submenu for Manage Products */}
            {item.title === 'Manage Products' && showProductOptions && (
              <View style={styles.subMenu}>
                <TouchableOpacity
                  style={styles.subButton}
                  onPress={() => navigation.navigate('CategoriesScreen' as never)}
                >
                  <Text style={styles.subButtonText}>📂 Category</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.subButton}
                  onPress={() => navigation.navigate('ProductScreen' as never)}
                >
                  <Text style={styles.subButtonText}>📦 Product</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5fff8',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#009e60',
  },
  menuList: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#009e60',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  subMenu: {
    marginLeft: 30,
    marginBottom: 10,
  },
  subButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e0f7eb',
    borderRadius: 8,
    marginTop: 5,
  },
  subButtonText: {
    fontSize: 14,
    color: '#009e60',
  },
});
