import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../types';
import { useCart } from '../context/CartContext';

type Props = DrawerScreenProps<DrawerParamList, 'Orders'>;

export default function OrdersScreen({ navigation }: Props) {
  const { orderHistory } = useCart();

  if (orderHistory.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📋 No Order History</Text>
        <Text style={styles.empty}>You haven't placed any orders yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📦 Order History</Text>

      {orderHistory.map((order, idx) => (
        <View key={idx} style={styles.orderCard}>
          <Text style={styles.label}>👤 Customer:</Text>
          <Text style={styles.value}>{order.customerName}</Text>

          {order.note ? (
            <>
              <Text style={styles.label}>📝 Note:</Text>
              <Text style={styles.value}>{order.note}</Text>
            </>
          ) : null}

          <Text style={styles.label}>🛒 Items:</Text>
          {order.items.map((prod, index) => (
            <Text key={index} style={styles.item}>
              - {prod.name} × {prod.quantity}
            </Text>
          ))}

          <Text style={styles.label}>💰 Total:</Text>
          <Text style={styles.total}>
            Rp {order.total.toLocaleString('id-ID')}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#009e60',
  },
  orderCard: {
    backgroundColor: '#f5fff8',
    padding: 16,
    borderRadius: 10,
    borderColor: '#009e60',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  item: {
    fontSize: 15,
    marginLeft: 12,
    marginTop: 4,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009e60',
    marginTop: 8,
  },
  empty: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 40,
  },
});
