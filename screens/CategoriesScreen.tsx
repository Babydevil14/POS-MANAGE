import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CategoryList from '../components/CategoryList';

const CategoriesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Categories</Text>
      <CategoryList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default CategoriesScreen;