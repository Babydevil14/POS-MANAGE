import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
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
  picture: string;
  category_id?: number;
};

type Category = {
  id: number;
  name: string;
};

export default function HomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

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
      setProducts((data as Product[]) || []);
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.picture }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      {/* MODIFIED: Changed to toLocaleString for better currency formatting */}
      <Text style={styles.price}>Rp {item.price.toLocaleString('id-ID')}</Text>
      <TouchableOpacity
        onPress={() =>
          addToCart({
            // MODIFIED: Added the missing 'product_id' property
            product_id: item.id,
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

      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryBtn,
              selectedCategory === cat.id && styles.selectedCategory,
            ]}
            onPress={() => {
              setSelectedCategory(cat.id);
              setSearchQuery('');
            }}
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
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          numColumns={2}
          ListEmptyComponent={() => (
            <Text style={styles.noResultsText}>No products found.</Text>
          )}
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
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
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
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});