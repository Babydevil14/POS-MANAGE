import { Picker } from '@react-native-picker/picker'; // Install: npm install @react-native-picker/picker
import React, { useEffect, useState } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import supabase from '../lib/supabaseClient';
import { Category, Product } from './types/index ';

// ...existing imports...
const initialForm = { id: '', name: '', price: '', picture: '', description: '', category_id: '', stock: '' };

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.price || !form.category_id) return;
    const { error } = await supabase.from('products').insert([
      {
        name: form.name,
        price: Number(form.price),
        picture: form.picture,
        description: form.description,
        category_id: form.category_id,
        stock: Number(form.stock) || 0,
      },
    ]);
    if (error) {
      console.error('Error adding product:', error);
    } else {
      setForm(initialForm);
      setShowForm(false);
      fetchProducts();
    }
  };

  const handleEditProduct = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      price: String(product.price),
      picture: product.picture || '',
      description: product.description || '',
      category_id: product.category_id || '',
      stock: product.stock !== undefined ? String(product.stock) : '',
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleUpdateProduct = async () => {
    if (!form.id || !form.name || !form.price || !form.category_id) return;
    const { error } = await supabase
      .from('products')
      .update({
        name: form.name,
        price: Number(form.price),
        picture: form.picture,
        description: form.description,
        category_id: form.category_id,
        stock: Number(form.stock) || 0,
      })
      .eq('id', form.id);
    if (error) {
      console.error('Error updating product:', error);
    } else {
      setForm(initialForm);
      setShowForm(false);
      setIsEditing(false);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Error deleting product:', error);
    } else {
      fetchProducts();
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setShowForm(false);
    setIsEditing(false);
  };

  const getCategoryName = (category_id: string) => {
    const cat = categories.find(c => c.id === category_id);
    return cat ? cat.name : '';
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            {item.picture ? (
              <Image source={{ uri: item.picture }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                <Text>📦</Text>
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
              {item.description ? <Text style={styles.productDesc}>{item.description}</Text> : null}
              <Text style={styles.productCategory}>Category: {getCategoryName(item.category_id)}</Text>
              <Text style={styles.productCategory}>Stock: {item.stock ?? 0}</Text>
            </View>
            <TouchableOpacity onPress={() => handleEditProduct(item)} style={styles.editBtn}>
              <Text style={{ color: '#fff' }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteProduct(item.id)} style={styles.deleteBtn}>
              <Text style={{ color: '#fff' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {showForm ? (
        <View style={styles.form}>
          <TextInput
            placeholder="Name"
            value={form.name}
            onChangeText={text => setForm({ ...form, name: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Price"
            value={form.price}
            onChangeText={text => setForm({ ...form, price: text })}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Stock"
            value={form.stock}
            onChangeText={text => setForm({ ...form, stock: text })}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Picture URL"
            value={form.picture}
            onChangeText={text => setForm({ ...form, picture: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            value={form.description}
            onChangeText={text => setForm({ ...form, description: text })}
            style={styles.input}
          />
          <Picker
            selectedValue={form.category_id}
            onValueChange={value => setForm({ ...form, category_id: value })}
            style={styles.input}
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map(cat => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
            ))}
          </Picker>
          <Button title={isEditing ? "Update" : "Save"} onPress={isEditing ? handleUpdateProduct : handleAddProduct} />
          <Button title="Cancel" onPress={handleCancel} />
        </View>
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={() => { setShowForm(true); setIsEditing(false); setForm(initialForm); }}>
          <Text style={styles.addButtonText}>ADD PRODUCT</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
  },
  productImage: { width: 60, height: 60, borderRadius: 8 },
  productName: { fontWeight: 'bold', fontSize: 16 },
  productPrice: { color: '#f90', fontWeight: 'bold' },
  productDesc: { fontSize: 12, color: '#888' },
  productCategory: { fontSize: 12, color: '#555' },
  editBtn: { backgroundColor: '#2980b9', padding: 8, borderRadius: 6, marginLeft: 8 },
  deleteBtn: { backgroundColor: '#e74c3c', padding: 8, borderRadius: 6, marginLeft: 8 },
  form: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginTop: 16, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginBottom: 8 },
  addButton: { backgroundColor: '#2196F3', padding: 16, borderRadius: 4, alignItems: 'center', marginTop: 16 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default ProductList;