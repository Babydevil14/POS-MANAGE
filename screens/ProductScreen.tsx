import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ProductList from '../components/ProductList';

const ProductsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Products</Text>
            <ProductList />
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

export default ProductsScreen;