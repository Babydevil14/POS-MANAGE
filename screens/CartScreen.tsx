import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

// Assuming CartItem is defined in your context, otherwise define it here
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type RootDrawerParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
  Cashier: undefined;
  Checkout: undefined;
};

type Props = DrawerScreenProps<RootDrawerParamList, 'Cart'>;

export default function CartScreen({ navigation }: Props) {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // This function seems to attempt to sync with a 'cart_items' table.
  // Make sure this table exists and is what you intend.
  const updateCartQuantity = async (itemId: number, quantity: number) => {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      console.error('Supabase update failed', error.message);
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        {/* MODIFIED: Changed price display to Rupiah format */}
        <Text style={styles.details}>
          {item.price.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          })}
        </Text>
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Qty:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={item.quantity.toString()}
            onChangeText={(text) => {
              const qty = parseInt(text) || 0;
              updateQuantity(item.id, qty); // local state update
              // updateCartQuantity(item.id, qty); // optional Supabase sync
            }}
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeFromCart(item.id)}
        style={styles.removeBtn}
      >
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛍 Your Cart</Text>

      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            style={styles.list}
          />
          {/* MODIFIED: Changed total price display to Rupiah format */}
          <Text style={styles.total}>
            Total: {totalPrice.toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            })}
          </Text>
          <Button
            title="Proceed to Checkout"
            onPress={() => navigation.navigate('Checkout')}
          />
          <Button title="Clear Cart" color="#f44336" onPress={clearCart} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', // Added background color for consistency
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  list: {
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4, // Added vertical margin
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  quantityLabel: {
    marginRight: 8,
    fontSize: 14, // Consistent font size
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 60,
    borderRadius: 4,
    textAlign: 'center', // Center the quantity text
  },
  removeBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'center',
  },
  removeText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 16,
  },
  empty: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});