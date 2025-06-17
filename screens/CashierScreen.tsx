import React from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity, Alert } from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../types';
import { useCart } from '../context/CartContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type Props = DrawerScreenProps<DrawerParamList, 'Cashier'>;

export default function CashierScreen({ navigation }: Props) {
  const { cartItems, clearCart, addOrderToHistory } = useCart();
  const [customerName, setCustomerName] = React.useState('');
  const [note, setNote] = React.useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentDate = new Date().toLocaleString();
  const cashierName = 'Admin';

  const handleCheckout = async () => {
    if (!customerName) {
      Alert.alert('Customer Name Required', 'Please enter the customer\'s name before checking out.');
      return;
    }

    const order = {
      customerName,
      note,
      total,
      items: cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    addOrderToHistory(order);
    clearCart();

    const htmlContent = `
      <html>
        <body style="font-family: sans-serif; padding: 24px;">
          <h1>🧾 Receipt</h1>
          <p><strong>Date:</strong> ${currentDate}</p>
          <p><strong>Cashier:</strong> ${cashierName}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
          <hr />
          <h2>Items:</h2>
          <ul>
            ${order.items
              .map((item) => `<li>${item.name} × ${item.quantity} - $${item.price.toFixed(2)}</li>`)
              .join('')}
          </ul>
          <hr />
          <h2>Total: $${total.toFixed(2)}</h2>
          <p>Thank you for your purchase!</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error(error);
      Alert.alert('Print Error', 'An error occurred while printing the receipt.');
    }

    navigation.navigate('Home');
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🛒 No items in cart</Text>
        <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Cashier</Text>

      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Note (optional)"
        value={note}
        onChangeText={setNote}
      />

      <View style={styles.summary}>
        {cartItems.map((item, idx) => (
          <Text key={idx}>
            {item.name} × {item.quantity} = ${item.price * item.quantity}
          </Text>
        ))}
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity onPress={handleCheckout} style={styles.checkoutButton}>
        <Text style={styles.checkoutButtonText}>🖨️ Checkout & Print</Text>
      </TouchableOpacity>

      <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  summary: {
    marginBottom: 20,
  },
  total: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 12,
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: '#009e60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
