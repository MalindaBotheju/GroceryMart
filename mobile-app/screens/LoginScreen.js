import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';
import { AuthContext } from '../AuthContext'; 
import BackgroundWrapper from '../components/BackgroundWrapper'; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Specific Error States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const { login, user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigation.replace('Home');
    }
  }, [user, navigation]);

  // Validation Logic
  const validateInputs = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!email) {
      setEmailError('Please fill in your email address.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email format.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please fill in your password.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Invalid password. Must be at least 6 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return; 

    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password
      });
      
      login(response.data.user);
      Alert.alert('Success', 'Login Successful!');
      navigation.replace('Home');
    } catch (error) {
      // NEW: Catch unverified users trying to log in and redirect them to the OTP Screen
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        Alert.alert('Verification Required', error.response.data.error);
        navigation.navigate('VerifyOtp', { email: email }); 
        return; // Stop execution here
      }

      const errorMsg = error.response?.data?.error || 'Invalid credentials or server error.';
      setGeneralError(errorMsg);
    }
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <View style={styles.card}>
          
          {/* Logo and Title */}
          <Ionicons name="basket" size={70} color="#4CAF50" style={styles.logo} />
          <Text style={styles.title}>GroceryMart</Text>

          {/* General Server Error */}
          {generalError ? <Text style={styles.errorTextCenter}>{generalError}</Text> : null}

          {/* Email Input */}
          <TextInput 
            style={[styles.input, emailError ? styles.inputError : null]} 
            placeholder="Email" 
            value={email}
            onChangeText={(text) => { setEmail(text); setEmailError(''); setGeneralError(''); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Password Input */}
          <TextInput 
            style={[styles.input, passwordError ? styles.inputError : null]} 
            placeholder="Password" 
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setPasswordError(''); setGeneralError(''); }}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    padding: 30, 
    borderRadius: 15, 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 8 
  },
  logo: { alignSelf: 'center', marginBottom: 5 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', marginBottom: 25 },
  input: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 5, fontSize: 16 },
  inputError: { borderColor: '#f44336', borderWidth: 1.5 },
  errorText: { color: '#f44336', fontSize: 13, marginBottom: 10, marginLeft: 5 },
  errorTextCenter: { color: '#f44336', fontSize: 14, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  forgotPasswordText: { color: '#666', textAlign: 'right', marginTop: 5, marginBottom: 5, fontSize: 14, fontWeight: '500' },
  button: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#2196F3', textAlign: 'center', marginTop: 20, fontSize: 16 }
});