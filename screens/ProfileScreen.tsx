import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  ProfileScreen: undefined;
  ManageScreen: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileScreen'>;

export default function ProfileScreen() {
  const adminName = 'Admin';
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const menuItems = [
    {
      title: 'Manage Products',
      icon: <Ionicons name="cube-outline" size={22} color="#009e60" />,
      action: () => navigation.navigate('ManageScreen'), // <-- Use navigation.navigate
    },
    {
      title: 'Order History',
      icon: <MaterialIcons name="history" size={22} color="#009e60" />,
    },
    {
      title: 'Sales Report',
      icon: <FontAwesome5 name="chart-line" size={20} color="#009e60" />,
    },
    {
      title: 'Settings',
      icon: <Ionicons name="settings-outline" size={22} color="#009e60" />,
    },
    {
      title: 'Logout',
      icon: <MaterialIcons name="logout" size={22} color="red" />,
      isLogout: true,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>👋 Welcome, {adminName}</Text>
      <View style={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, item.isLogout && { borderColor: 'red' }]}
            onPress={() => {
              if (item.isLogout) {
                console.log('Logging out...');
              } else if (item.action) {
                item.action();
              }
            }}
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
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});