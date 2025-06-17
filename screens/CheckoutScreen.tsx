import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation }: Props) {
  const { cartItems, clearCart, addOrderToHistory } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      Alert.alert('Warning', 'Please enter customer name.');
      return;
    }

    setLoading(true);
    try {
      // Update product stock
      const updates = cartItems.map((product) =>
        supabase
          .from('products')
          .update({ stock: product.stock - product.quantity })
          .eq('id', product.id)
      );

      const results = await Promise.all(updates);
      for (const { error } of results) {
        if (error) throw error;
      }

      // Save order to history
      addOrderToHistory({
        customerName,
        note,
        total: totalPrice,
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      clearCart();
      Alert.alert('Success', 'Checkout completed successfully!');
      navigation.navigate('Cashier');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'There was a problem during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧾 Checkout Summary</Text>

      <TextInput
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
        style={styles.input}
      />

      <TextInput
        placeholder="Note (optional)"
        value={note}
        onChangeText={setNote}
        style={styles.input}
      />

      {cartItems.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text>
            {item.name} × {item.quantity}
          </Text>
          <Text>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</Text>
        </View>
      ))}

      <Text style={styles.total}>
        Total: Rp {totalPrice.toLocaleString('id-ID')}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Confirm and Pay" onPress={handleCheckout} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'right',
  },
});
