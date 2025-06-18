import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal, // For custom alert
  TouchableOpacity, // For custom alert button
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App'; // Assuming RootStackParamList is defined in App.tsx

// Define the props for the CheckoutScreen, indicating it's a NativeStackScreen for 'Checkout'
type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

/**
 * CheckoutScreen component summarizes the cart items, collects customer information,
 * processes the order by saving to Supabase (transactions and transaction_items tables),
 * updates product stock, and navigates to the Cashier screen upon successful checkout.
 */
export default function CheckoutScreen({ navigation }: Props) {
  // Destructure cart-related functions and data from the CartContext
  const { cartItems, clearCart, addOrderToHistory } = useCart();
  const [loading, setLoading] = useState(false); // State for managing loading indicator
  const [customerName, setCustomerName] = useState(''); // State for customer name input
  const [note, setNote] = useState(''); // State for optional note input
  const [modalVisible, setModalVisible] = useState(false); // State for custom alert modal visibility
  const [modalMessage, setModalMessage] = useState(''); // State for custom alert modal message

  // Calculate the total price of all items in the cart
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /**
   * Displays a custom alert modal with the given message.
   * @param message The message to display in the alert.
   */
  const showAlert = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  /**
   * Handles the checkout process:
   * 1. Validates customer name.
   * 2. Inserts a new transaction record into the 'transactions' table in Supabase.
   * 3. Inserts each cart item as a 'transaction_item' linked to the new transaction.
   * 4. Updates the stock of each product in the 'products' table.
   * 5. Clears the local cart, adds the order to history (for immediate UI update),
   * and navigates to the Cashier screen, passing transaction details.
   */
  const handleCheckout = async () => {
    // Validate that a customer name has been entered
    if (!customerName.trim()) {
      showAlert('Please enter customer name.');
      return;
    }

    setLoading(true); // Start loading indicator
    try {
      // 1. Insert a new transaction record into the 'transactions' table
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            customer_name: customerName,
            note: note,
            total_price: totalPrice,
            created_at: new Date().toISOString(), // Use ISO string for Supabase timestamp
          },
        ])
        .select(); // Request the inserted data, especially the generated 'id'

      if (transactionError) {
        console.error('Supabase transaction insertion failed:', transactionError.message);
        throw new Error('Failed to create transaction.');
      }
      const transactionId = transactionData[0].id; // Get the ID of the newly created transaction

      // 2. Prepare and insert individual transaction items into the 'transaction_items' table
      const transactionItemsToInsert = cartItems.map(item => ({
        transaction_id: transactionId,
        product_id: item.id, // Assuming item.id from cart is the product_id
        quantity: item.quantity,
        total_price: item.price * item.quantity, // Total price for this specific line item
        created_at: new Date().toISOString(),
      }));

      const { error: transactionItemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItemsToInsert);

      if (transactionItemsError) {
        console.error('Supabase transaction items insertion failed:', transactionItemsError.message);
        throw new Error('Failed to save transaction items.');
      }

      // 3. Update product stock in the 'products' table for each item
      const stockUpdatePromises = cartItems.map((product) =>
        supabase
          .from('products')
          .update({ stock: product.stock - product.quantity }) // Decrease stock by quantity sold
          .eq('id', product.id) // Identify the product by its ID
      );

      const stockUpdateResults = await Promise.all(stockUpdatePromises);
      for (const { error } of stockUpdateResults) {
        if (error) {
          console.error('Supabase stock update failed:', error.message);
          throw new Error('Failed to update product stock.');
        }
      }

      // 4. Clear local cart, add order to history, and navigate
      addOrderToHistory({
        // Add to local history for immediate display on OrdersScreen (optional if only using DB)
        customerName,
        note,
        total: totalPrice,
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: new Date().toISOString(), // Add creation timestamp
      });
      clearCart(); // Clear items from the local cart context
      showAlert('Checkout completed successfully!');
      // Navigate to the Cashier screen, passing the transaction ID and total amount
      navigation.navigate('Cashier', { transactionId: transactionId, totalAmount: totalPrice });
    } catch (error: any) {
      console.error(error);
      showAlert(error.message || 'There was a problem during checkout.');
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧾 Checkout Summary</Text>

      {/* Input for Customer Name */}
      <TextInput
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
        style={styles.input}
      />

      {/* Input for Optional Note */}
      <TextInput
        placeholder="Note (optional)"
        value={note}
        onChangeText={setNote}
        style={styles.input}
        multiline={true} // Allow multiple lines for notes
        numberOfLines={3} // Provide initial height
      />

      {/* Display list of cart items for summary */}
      <View style={styles.itemsSummary}>
        <Text style={styles.summaryHeader}>Order Items:</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemName}>
              {item.name} × {item.quantity}
            </Text>
            <Text style={styles.itemPrice}>
              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
            </Text>
          </View>
        ))}
      </View>

      {/* Display the total amount to pay */}
      <Text style={styles.total}>
        Total: Rp {totalPrice.toLocaleString('id-ID')}
      </Text>

      {/* Conditionally render loading indicator or "Confirm and Pay" button */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Button
          title="Confirm and Pay"
          onPress={handleCheckout}
          color="#28a745" // Green color for confirm button
        />
      )}

      {/* Custom Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f7fa', // Light background color
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  itemsSummary: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 16,
    color: '#444',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  total: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 25,
    textAlign: 'right',
    color: '#333',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
