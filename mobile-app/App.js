import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CartProvider } from './CartContext'; 
import { AuthProvider } from './AuthContext'; // Already imported

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen'; 
import ProfileScreen from './screens/ProfileScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import SplashScreen from './screens/SplashScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen'; // Adjust path if necessary
import VerifyOtpScreen from './screens/VerifyOtpScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    // NEW: Wrap the whole app in the AuthProvider first
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen 
              name="Splash" 
              component={SplashScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen 
              name="VerifyOtp" 
              component={VerifyOtpScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'GroceryMart' }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Account' }} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}