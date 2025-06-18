import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useCart } from '../context/CartContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Cashier'>;

export default function CashierScreen({ navigation, route }: Props) {
  // Check if route.params exists. If not, this screen was opened from the drawer.
  if (!route.params) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>💰 Cashier</Text>
        <Text style={styles.emptyText}>
          This screen is for completing a transaction after checkout.
        </Text>
        <Text style={styles.emptyText}>
          Please go to the Home screen, add items to your cart, and proceed to checkout.
        </Text>
        <View style={{ marginTop: 20 }}>
          <Button
            title="Go to Home Screen"
            // MODIFIED: Specify the screen within the 'Main' navigator
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          />
        </View>
      </View>
    );
  }

  const { clearCart } = useCart();
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [changeDue, setChangeDue] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const { transactionId, totalAmount: initialTotalAmount } = route.params;

  const total = transactionDetails?.total_price || initialTotalAmount || 0;

  const currentDate = new Date().toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
  const cashierName = 'Admin';

  const showAlert = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!transactionId) {
        showAlert('No transaction ID provided. Displaying initial total from cart.');
        return;
      }
      try {
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (transactionError) {
          console.error('Error fetching transaction:', transactionError.message);
          showAlert('Failed to load transaction details.');
          return;
        }

        const { data: transactionItems, error: itemsError } = await supabase
          .from('transaction_items')
          .select('*')
          .eq('transaction_id', transactionId);

        if (itemsError) {
          console.error('Error fetching transaction items:', itemsError.message);
          showAlert('Failed to load transaction item details.');
          return;
        }

        const productIds = transactionItems.map(item => item.product_id);
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);

        if (productsError) {
          console.error("Error fetching product names:", productsError.message);
          showAlert("Could not fetch all product names for the receipt.");
        }

        const productMap = new Map(productsData?.map(p => [p.id, p.name]));

        const detailedItems = transactionItems.map((item: any) => ({
          name: productMap.get(item.product_id) || `Product ID: ${item.product_id}`,
          quantity: item.quantity,
          price: item.total_price / item.quantity,
          lineTotal: item.total_price,
        }));

        setTransactionDetails({ ...transaction, items: detailedItems });
      } catch (error: any) {
        console.error("Error in fetching transaction details:", error.message);
        showAlert('An unexpected error occurred while fetching transaction details.');
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  useEffect(() => {
    const paid = parseFloat(amountPaid);
    if (!isNaN(paid) && paid >= total) {
      setChangeDue(paid - total);
    } else {
      setChangeDue(0);
    }
  }, [amountPaid, total]);

  const handlePrintReceipt = async () => {
    if (!transactionDetails) {
      showAlert('No transaction data available for receipt.');
      return;
    }

    const itemsHtml = transactionDetails.items
      .map(
        (item: any) =>
          `<li>${item.name} × ${item.quantity} - Rp ${item.lineTotal.toLocaleString('id-ID')}</li>`
      )
      .join('');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 24px; color: #333; }
            h1, h2 { color: #007bff; }
            hr { border: 0; border-top: 1px dashed #ccc; margin: 20px 0; }
            ul { list-style: none; padding: 0; }
            li { margin-bottom: 8px; font-size: 16px; }
            .label { font-weight: bold; margin-top: 10px; display: block; }
            .value { margin-bottom: 5px; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-text { font-size: 24px; font-weight: bold; color: #28a745; }
            .change-text { font-size: 20px; font-weight: bold; color: #ffc107; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>🧾 Receipt</h1>
          <p><span class="label">Date:</span> <span class="value">${currentDate}</span></p>
          <p><span class="label">Cashier:</span> <span class="value">${cashierName}</span></p>
          <p><span class="label">Customer:</span> <span class="value">${transactionDetails.customer_name}</span></p>
          ${
            transactionDetails.note
              ? `<p><span class="label">Note:</span> <span class="value">${transactionDetails.note}</span</p>`
              : ''
          }
          <hr />
          <h2>Items:</h2>
          <ul>${itemsHtml}</ul>
          <hr />
          <div class="total-section">
            <p class="total-text">Total: Rp ${total.toLocaleString('id-ID')}</p>
            <p class="total-text">Paid: Rp ${parseFloat(amountPaid || '0').toLocaleString('id-ID')}</p>
            <p class="change-text">Change: Rp ${changeDue.toLocaleString('id-ID')}</p>
          </div>
          <p style="text-align: center; margin-top: 30px;">Thank you for your purchase!</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error: any) {
      console.error('Print/Share Error:', error);
      showAlert('An error occurred while printing or sharing the receipt: ' + error.message);
    }
    // MODIFIED: Specify the screen within the 'Main' navigator
    navigation.navigate('Main', { screen: 'Home' });
  };

  if (!transactionDetails && transactionId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>💰 Cashier</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeader}>Transaction Summary:</Text>
          <Text style={styles.detailText}>
            Customer: {transactionDetails?.customer_name || 'N/A'}
          </Text>
          {transactionDetails?.note ? (
            <Text style={styles.detailText}>Note: {transactionDetails.note}</Text>
          ) : null}
          <Text style={styles.detailText}>
            Date: {new Date(transactionDetails?.created_at).toLocaleString() || 'N/A'}
          </Text>
          <View style={styles.itemsList}>
            <Text style={styles.itemsListHeader}>Items:</Text>
            {transactionDetails?.items?.map((item: any, index: number) => (
              <Text key={index} style={styles.itemText}>
                - {item.name} × {item.quantity} = Rp {item.lineTotal.toLocaleString('id-ID')}
              </Text>
            ))}
          </View>
          <Text style={styles.total}>
            Total Due: Rp {total.toLocaleString('id-ID')}
          </Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Amount Paid (e.g., 150000)"
          keyboardType="numeric"
          value={amountPaid}
          onChangeText={setAmountPaid}
        />
        <Text style={styles.change}>
          Change Due: Rp {changeDue.toLocaleString('id-ID')}
        </Text>
        <TouchableOpacity onPress={handlePrintReceipt} style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>🖨️ Print & Share Receipt</Text>
        </TouchableOpacity>
        <Button title="New Transaction" onPress={() => navigation.navigate('Main', { screen: 'Home' })} />
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
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 10,
    lineHeight: 24,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  itemsList: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  itemsListHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666',
  },
  itemText: {
    fontSize: 15,
    marginLeft: 10,
    marginBottom: 3,
    color: '#444',
  },
  total: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'right',
    color: '#28a745',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  change: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
    marginBottom: 25,
    color: '#ffc107',
  },
  checkoutButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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
