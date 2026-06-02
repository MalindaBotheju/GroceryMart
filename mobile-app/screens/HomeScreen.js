import React, { useState, useEffect, useLayoutEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image, TouchableOpacity, TextInput, Dimensions, Platform, StatusBar } from 'react-native';
import axios from 'axios';
import { CartContext } from '../CartContext'; 
import { Ionicons } from '@expo/vector-icons'; 
import BackgroundWrapper from '../components/BackgroundWrapper'; 

const { width } = Dimensions.get('window');

// HARDCODED CATEGORIES DELETED! The app now fetches them from your database.

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  
  // NEW: State to hold dynamic categories
  const [categories, setCategories] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); 
  
  const { cart, addToCart } = useContext(CartContext);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    // NEW: Fetch both categories and products when the screen loads
    fetchCategories();
    fetchProducts();
  }, []);

  // NEW: Function to pull categories from your backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://10.29.171.206:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://10.29.171.206:5000/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category_name === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const renderCategory = ({ item }) => {
    const isSelected = selectedCategory === item.name;
    return (
      <TouchableOpacity 
        style={styles.categoryItem}
        onPress={() => setSelectedCategory(isSelected ? null : item.name)} 
      >
        {/* FIXED: Removed item.color context dependency layout styling rule */}
        <View style={[
          styles.categoryIconBox, 
          isSelected && styles.categoryIconBoxSelected 
        ]}>
          {/* FIXED: Replaced Ionicons element with real Image renderer */}
          <Image 
            source={{ uri: item.image_url }} 
            style={{ width: 40, height: 40, resizeMode: 'contain' }} 
          /> 
        </View>
        <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productWeight}>{item.quantity_amount} {item.quantity_unit}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>LKR {item.price}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        
        <View style={styles.headerContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search Your Groceries"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <FlatList 
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2} 
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
              </View>
              <View style={styles.categoriesWrapper}>
                <FlatList 
                  // NEW: Uses the state variable instead of the hardcoded array
                  data={categories} 
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderCategory}
                  contentContainerStyle={styles.categoriesList}
                />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Products</Text>
              </View>
            </>
          }
          renderItem={renderProduct}
        />

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color="#4CAF50" />
            <Text style={[styles.navText, { color: '#4CAF50' }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Cart')}>
            <View>
              <Ionicons name="cart-outline" size={24} color="#888" />
              {cart.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cart.length}</Text>
                </View>
              )}
            </View>
            <Text style={styles.navText}>Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={24} color="#888" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>

      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'rgba(255, 255, 255, 0.4)' 
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerContainer: {
    backgroundColor: '#4CAF50',
    paddingTop: Platform.OS === 'android' ? 60 : 50, 
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    alignItems: 'center',
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },

  listContent: {
    paddingBottom: 130, 
  },

  sectionHeader: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoriesWrapper: {
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  categoryIconBox: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: '#F4F6F4', // Soft uniform background tint for modern aesthetic look
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconBoxSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },

  productCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    margin: 10,
    width: (width / 2) - 20,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productWeight: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto', 
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addBtn: {
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'android' ? 35 : 25,
    paddingTop: 10,
    height: Platform.OS === 'android' ? 95 : 85,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});