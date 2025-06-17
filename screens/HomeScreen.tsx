import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

type RootDrawerParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
  Cashier: undefined;
};

type Props = DrawerScreenProps<RootDrawerParamList, 'Home'>;

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  picture: string; // CHANGED: From image_url to picture
  category_id?: number;
};

type Category = {
  id: number;
  name: string;
};

export default function HomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(-1); // -1 for All

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error('Fetch categories error:', error);
    } else {
      const allCategory = { id: -1, name: 'ALL' };
      setCategories([allCategory, ...(data as Category[])]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');
    if (selectedCategory !== -1) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Fetch products error:', error);
    } else {
      // Cast the data as Product[] and ensure it uses 'picture'
      setProducts((data as Product[]) || []);
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      {/* CHANGED: Use item.picture for the image source */}
      <Image source={{ uri: item.picture }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity
        onPress={() =>
          addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            stock: item.stock,
          })
        }
        style={styles.button}
      >
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Welcome to MarketApp</Text>
      </View>

      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryBtn,
              selectedCategory === cat.id && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.selectedText,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          numColumns={2}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 16,
    margin: 4,
  },
  selectedCategory: {
    backgroundColor: '#009e60',
  },
  categoryText: {
    color: '#000',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  price: {
    marginVertical: 4,
    color: '#444',
  },
  button: {
    backgroundColor: '#009e60',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
  },
});