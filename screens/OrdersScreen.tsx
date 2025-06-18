import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../types'; // Assuming DrawerParamList is defined in types.ts
import { supabase } from '../lib/supabase'; // Import supabase for database interaction

// Define the props for the OrdersScreen
type Props = DrawerScreenProps<DrawerParamList, 'Orders'>;

/**
 * OrdersScreen component displays a historical list of transactions (orders)
 * fetched directly from the Supabase database. It shows customer details,
 * order items, total price, and notes for each transaction.
 */
export default function OrdersScreen({ navigation }: Props) {
  const [dbOrders, setDbOrders] = useState<any[]>([]); // State to store orders fetched from database
  const [loadingOrders, setLoadingOrders] = useState(true); // State for loading indicator
  const [modalVisible, setModalVisible] = useState(false); // State for custom alert modal visibility
  const [modalMessage, setModalMessage] = useState(''); // State for custom alert modal message

  /**
   * Displays a custom alert modal with the given message.
   * @param message The message to display in the alert.
   */
  const showAlert = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  // Effect to fetch order data from Supabase when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true); // Start loading indicator
      try {
        // 1. Fetch all transactions from the 'transactions' table
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*') // Select all columns from the transactions table
          .order('created_at', { ascending: false }); // Order by creation date descending

        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError.message);
          showAlert('Failed to load transaction history.');
          return;
        }

        // Get all unique transaction IDs to fetch their corresponding items
        const transactionIds = transactions.map(t => t.id);

        let transactionItems: any[] = [];
        if (transactionIds.length > 0) {
          // 2. Fetch all related transaction items for the fetched transactions
          const { data: items, error: itemsError } = await supabase
            .from('transaction_items')
            .select('*') // Select all columns from the transaction_items table
            .in('transaction_id', transactionIds); // Filter items by the fetched transaction IDs

          if (itemsError) {
            console.error('Error fetching transaction items:', itemsError.message);
            showAlert('Failed to load transaction item details.');
            return;
          }
          transactionItems = items;
        }

        // Get all unique product IDs from transaction items to fetch product names
        const productIds = [...new Set(transactionItems.map(item => item.product_id))];
        let productsData: any[] = [];
        if (productIds.length > 0) {
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id, name') // Only need id and name for display
                .in('id', productIds);

            if (productsError) {
                console.error("Error fetching product names:", productsError.message);
                showAlert("Could not fetch some product names for the order history.");
            }
            productsData = products || [];
        }
        const productMap = new Map(productsData.map(p => [p.id, p.name]));

        // 3. Combine transactions with their respective items and product names
        const combinedOrders = transactions.map(transaction => {
          const itemsForThisOrder = transactionItems
            .filter(item => item.transaction_id === transaction.id)
            .map(item => ({
              name: productMap.get(item.product_id) || `Product ID: ${item.product_id}`,
              quantity: item.quantity,
              price: item.total_price / item.quantity,
              lineTotal: item.total_price,
            }));

          return {
            id: transaction.id,
            customerName: transaction.customer_name,
            note: transaction.note,
            total: transaction.total_price,
            items: itemsForThisOrder,
            createdAt: transaction.created_at,
          };
        });

        setDbOrders(combinedOrders); // Update state with fetched and combined orders
      } catch (error: any) {
        console.error('Error fetching orders:', error.message);
        showAlert('An unexpected error occurred while loading order history.');
      } finally {
        setLoadingOrders(false); // Stop loading indicator
      }
    };

    fetchOrders();
  }, []); // Empty dependency array means this effect runs once on component mount

  if (loadingOrders) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading order history...</Text>
      </View>
    );
  }

  if (dbOrders.length === 0) {
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

      {dbOrders.map((order, idx) => (
        <View key={order.id || idx} style={styles.orderCard}>
          <Text style={styles.label}>👤 Customer:</Text>
          <Text style={styles.value}>{order.customerName}</Text>

          {order.note ? (
            <>
              <Text style={styles.label}>📝 Note:</Text>
              <Text style={styles.value}>{order.note}</Text>
            </>
          ) : null}

          <Text style={styles.label}>🗓️ Date:</Text>
          <Text style={styles.value}>
            {/* MODIFIED: Added a check to prevent crash if createdAt is null */}
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
          </Text>

          <Text style={styles.label}>🛒 Items:</Text>
          {order.items.map((prod: any, index: number) => (
            <Text key={index} style={styles.item}>
              {/* MODIFIED: Added fallback to 0 to prevent crash */}
              - {prod.name} × {prod.quantity} (Rp {(prod.lineTotal ?? 0).toLocaleString('id-ID')})
            </Text>
          ))}

          <Text style={styles.label}>💰 Total:</Text>
          <Text style={styles.total}>
            {/* MODIFIED: Added fallback to 0 to prevent crash. THIS IS THE MAIN FIX. */}
            Rp {(order.total ?? 0).toLocaleString('id-ID')}
          </Text>
        </View>
      ))}

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
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007bff',
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  item: {
    fontSize: 15,
    marginLeft: 15,
    marginTop: 4,
    color: '#444',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745', // Green for total
    marginTop: 15,
    textAlign: 'right',
  },
  empty: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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