import React, { useState, useEffect, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Platform, StatusBar } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Hide the default navigation header so we can use our custom one
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (user && user.email) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      // Remember to match your computer's IP address!
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/orders/${user.email}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = ({ item, index }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderLeft}>
        <View style={styles.iconBox}>
          <Ionicons name="bag-check" size={20} color="#4CAF50" />
        </View>
        {/* Use the list index instead of the database ID */}
        <Text style={styles.orderId}>Order {index + 1}</Text>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.orderTotalLabel}>Total</Text>
        <Text style={styles.orderTotal}>LKR {item.total_price}</Text>
        <Text style={{ 
          fontSize: 12, 
          marginTop: 4, 
          fontWeight: 'bold', 
          textTransform: 'uppercase',
          color: item.status === 'paid' ? '#4CAF50' : '#f44336' 
        }}>
          {item.status}
        </Text>
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
        
        {/* CUSTOM GREEN HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        {/* ORDER LIST OR EMPTY STATE */}
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList 
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrder}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'rgba(255, 255, 255, 0.4)' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // HEADER STYLES
  headerContainer: {
    backgroundColor: '#4CAF50',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 50, 
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, 
  },

  // LIST & CARD STYLES
  listContent: { 
    padding: 20,
    paddingBottom: 40,
  },
  orderCard: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 15, 
    marginBottom: 15, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderId: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderTotalLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  orderTotal: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#4CAF50' 
  },

  // EMPTY STATE STYLES
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -50,
  },
  emptyText: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginTop: 15, 
    marginBottom: 25,
    color: '#888',
    fontWeight: '500'
  },
  shopButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});