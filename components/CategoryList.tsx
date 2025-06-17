import React, { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import supabase from '../lib/supabaseClient';
import { Category } from './types/index ';

const initialForm = { id: '', name: '' };

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      Alert.alert('Error fetching categories', error.message);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!form.name) return;
    const { error } = await supabase.from('categories').insert([{ name: form.name }]);
    if (error) {
      Alert.alert('Error adding category', error.message);
    } else {
      setForm(initialForm);
      setShowForm(false);
      fetchCategories();
    }
  };

  const handleEditCategory = (category: Category) => {
    setForm({ id: category.id, name: category.name });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleUpdateCategory = async () => {
    if (!form.id || !form.name) return;
    const { error } = await supabase
      .from('categories')
      .update({ name: form.name })
      .eq('id', form.id);
    if (error) {
      Alert.alert('Error updating category', error.message);
    } else {
      setForm(initialForm);
      setShowForm(false);
      setIsEditing(false);
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) {
      Alert.alert('Error deleting category', error.message);
    } else {
      fetchCategories();
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setShowForm(false);
    setIsEditing(false);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <Text>{item.name}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={() => handleEditCategory(item)} style={styles.editBtn}>
          <Text style={{ color: '#fff' }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteCategory(item.id)} style={styles.deleteBtn}>
          <Text style={{ color: '#fff' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1 }}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
        />
      </View>
      <View style={styles.bottomFormContainer}>
        {showForm ? (
          <View style={styles.form}>
            <TextInput
              placeholder="Category Name"
              value={form.name}
              onChangeText={text => setForm({ ...form, name: text })}
              style={styles.input}
            />
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1, marginRight: 8 }]}
                onPress={isEditing ? handleUpdateCategory : handleAddCategory}
              >
                <Text style={{ color: '#fff', textAlign: 'center' }}>{isEditing ? "Update" : "Save"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelBtn, { flex: 1 }]}
                onPress={handleCancel}
              >
                <Text style={{ color: '#fff', textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setShowForm(true);
              setIsEditing(false);
              setForm(initialForm);
            }}
          >
            <Text style={styles.addButtonText}>ADD CATEGORY</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    justifyContent: 'space-between',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: { backgroundColor: '#2980b9', padding: 8, borderRadius: 6, marginRight: 8 },
  deleteBtn: { backgroundColor: '#e74c3c', padding: 8, borderRadius: 6 },
  bottomFormContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginBottom: 8 },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  saveBtn: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
  },
  cancelBtn: {
    backgroundColor: '#888',
    padding: 12,
    borderRadius: 4,
  },
});

export default CategoryList;