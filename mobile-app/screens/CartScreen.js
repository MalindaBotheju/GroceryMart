import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, Image, StatusBar, Modal } from 'react-native';
import { WebView } from 'react-native-webview'; 
import axios from 'axios';
import { CartContext } from '../CartContext';
import { AuthContext } from '../AuthContext'; 
import { Ionicons } from '@expo/vector-icons'; 
import BackgroundWrapper from '../components/BackgroundWrapper'; 

export default function CartScreen({ navigation }) {
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext); 
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [paymentParams, setPaymentParams] = useState(null);
  const [showWebView, setShowWebView] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const calculateTotal = () => {
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.cartQuantity), 0);
    return total.toFixed(2); 
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const totalAmount = calculateTotal();
      
      // IMPORTANT: Check your IP!
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/payments/checkout`, {
        userEmail: user ? user.email : 'guest@test.com',
        userName: user ? user.name : 'Guest',
        totalPrice: totalAmount
      });

      // ADD THIS LINE TO INSPECT THE PAYLOAD:
      console.log("PAYHERE PAYLOAD:", response.data);
      
      setPaymentParams(response.data);
      setShowWebView(true);
      
    } catch (error) {
      console.error("Payment initialization failed:", error);
      Alert.alert("Checkout Error", "Could not connect to payment gateway. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- BROUGHT BACK THE HTML FORM ---
  const generatePayHereHTML = (params) => {
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f4; margin: 0; }
            .spinner { border: 4px solid rgba(0,0,0,0.1); width: 40px; height: 40px; border-radius: 50%; border-left-color: #4CAF50; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body onload="document.forms[0].submit();">
          <div class="spinner"></div>
          <form method="post" action="https://sandbox.payhere.lk/pay/checkout" style="display: none;">
            ${Object.keys(params).map(key => `<input type="hidden" name="${key}" value="${params[key]}" />`).join('')}
          </form>
        </body>
      </html>
    `;
  };

  const handleNavigationStateChange = async (navState) => {
    const url = navState.url;
    console.log("WEBVIEW URL CHANGED TO:", url); 

    if (url.includes('grocerymart.com/success')) { 
      setShowWebView(false); 
      
      try {
        // IMPORTANT: Check your IP!
        await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/orders`, { 
          email: user ? user.email : 'guest@test.com', 
          cartItems: cart,
          totalAmount: calculateTotal()
        });
        
        Alert.alert("Payment Successful!", "Your groceries are on the way.");
        clearCart();
        navigation.navigate('OrderHistory'); 
        
      } catch (error) {
        console.error("Order save failed after payment:", error);
        Alert.alert("Warning", "Payment successful, but trouble saving receipt.");
      }

    } else if (url.includes('grocerymart.com/cancel')) { 
      setShowWebView(false);
      Alert.alert("Payment Canceled", "You have not been charged.");
    }
  };

  const renderCartItem = ({ item }) => {
    const itemTotal = (parseFloat(item.price) * item.cartQuantity).toFixed(2);
    const itemPrice = parseFloat(item.price).toFixed(2);

    return (
      <View style={styles.itemCard}>
        <Image source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} style={styles.productImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>LKR {itemPrice} x {item.cartQuantity}</Text>
        </View>
        <Text style={styles.itemTotal}>LKR {itemTotal}</Text>
      </View>
    );
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#bbb" />
            <Text style={styles.emptyText}>Your cart is empty!</Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList 
              data={cart}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCartItem}
              contentContainerStyle={styles.listContent} 
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View style={{ height: 170 }} />}
            />
            
            <View style={styles.footer}>
              <View style={styles.priceContainer}>
                <Text style={styles.totalPriceLabel}>Total Price</Text>
                <Text style={styles.finalAmount}>LKR {calculateTotal()}</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.checkoutButton, isProcessing && styles.checkoutButtonDisabled]} 
                onPress={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.checkoutText}>Checkout</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        <Modal visible={showWebView} animationType="slide" transparent={false}>
          <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 40 : 0 }}>
            <View style={styles.webviewHeader}>
              <TouchableOpacity onPress={() => setShowWebView(false)}>
                <Text style={styles.cancelPaymentText}>Cancel Payment</Text>
              </TouchableOpacity>
              <Text style={styles.secureText}>Secure Checkout</Text>
              <View style={{ width: 60 }} />
            </View>

            {paymentParams && (
            <WebView
              source={{ 
                uri: 'https://sandbox.payhere.lk/pay/checkout',
                method: 'POST',
                // ⚡ Content-Type header removed; WebView handles this automatically for POST bodies
                body: Object.keys(paymentParams)
                  .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(paymentParams[key]))
                  .join('&')
              }}
              onNavigationStateChange={handleNavigationStateChange}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              thirdPartyCookiesEnabled={true} 
              mixedContentMode="always"       
              originWhitelist={['*']}         
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webviewLoader}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                </View>
              )}
            />
          )}
          </View>
        </Modal>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.4)' },
  headerContainer: { backgroundColor: '#4CAF50', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 50, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  headerSpacer: { width: 40 },
  listContent: { padding: 16 },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 15, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  productImage: { width: 55, height: 55, borderRadius: 10, marginRight: 15, backgroundColor: '#f5f5f5' },
  itemInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  price: { color: '#888', marginTop: 4, fontSize: 14 },
  itemTotal: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 18, textAlign: 'center', marginTop: 15, color: '#666', fontWeight: '500' },
  shopNowBtn: { marginTop: 20, backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, elevation: 3 },
  shopNowText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, paddingBottom: Platform.OS === 'android' ? 50 : 40, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10 },
  priceContainer: { flex: 1 },
  totalPriceLabel: { fontSize: 13, color: '#999', fontWeight: '600', marginBottom: 2 },
  finalAmount: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50' },
  checkoutButton: { backgroundColor: '#4CAF50', paddingVertical: 14, paddingHorizontal: 45, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  checkoutButtonDisabled: { backgroundColor: '#9E9E9E' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  webviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  cancelPaymentText: { color: '#f44336', fontWeight: '600', fontSize: 16 },
  secureText: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  webviewLoader: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }
});