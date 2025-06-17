import React, { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import supabase from '../lib/supabaseClient';
import { Product, Transaction } from './types/index ';

const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
  };

  const calculateTotal = () => {
    return transactions.reduce((total, transaction) => total + transaction.total_price, 0);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const product = products.find(p => p.id === item.product_id);
    return (
      <View>
        <Text>{product ? product.name : 'Unknown Product'}</Text>
        <Text>{item.total_price}</Text>
      </View>
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
      />
      <Text>Total: {calculateTotal()}</Text>
      <Button title="Add Transaction" onPress={() => {/* Functionality to add transaction */}} />
    </View>
  );
};

export default TransactionList;