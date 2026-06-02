import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';
import BackgroundWrapper from '../components/BackgroundWrapper'; 

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Specific Error States
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Validation Logic
  const validateInputs = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setGeneralError('');

    if (!name.trim()) {
      setNameError('Please enter your full name.');
      isValid = false;
    }

    if (!email) {
      setEmailError('Please fill in your email address.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email format.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please create a password.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      // NOTE: Later, this API will send the OTP email instead of just creating the account instantly!
      const response = await axios.post('http://10.29.171.206:5000/api/auth/register', {
        name,
        email,
        password
      });
      
      Alert.alert(
        'Verification Sent', 
        'Please check your email for your 6-digit registration code!'
      );
      
      // Navigate back to Login so they can sign in with their new credentials
      navigation.navigate('VerifyOtp', { email: email });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to register. Email might already exist.';
      setGeneralError(errorMsg);
    }
  };

  return (
    <BackgroundWrapper>
      {/* KeyboardAvoidingView ensures the keyboard doesn't cover the inputs */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            
            {/* Logo and Title */}
            <Ionicons name="person-add" size={60} color="#4CAF50" style={styles.logo} />
            <Text style={styles.title}>Create Account</Text>

            {/* General Server Error */}
            {generalError ? <Text style={styles.errorTextCenter}>{generalError}</Text> : null}

            {/* Name Input */}
            <TextInput 
              style={[styles.input, nameError ? styles.inputError : null]} 
              placeholder="Full Name" 
              value={name}
              onChangeText={(text) => { setName(text); setNameError(''); setGeneralError(''); }}
              autoCapitalize="words"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

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
              placeholder="Password (Min. 6 characters)" 
              secureTextEntry
              value={password}
              onChangeText={(text) => { setPassword(text); setPasswordError(''); setGeneralError(''); }}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Confirm Password Input */}
            <TextInput 
              style={[styles.input, confirmError ? styles.inputError : null]} 
              placeholder="Confirm Password" 
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setConfirmError(''); setGeneralError(''); }}
            />
            {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

            {/* Register Button */}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            
            {/* Back to Login Link */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Already have an account? Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 5, fontSize: 16 },
  inputError: { borderColor: '#f44336', borderWidth: 1.5 },
  errorText: { color: '#f44336', fontSize: 13, marginBottom: 10, marginLeft: 5 },
  errorTextCenter: { color: '#f44336', fontSize: 14, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  button: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#2196F3', textAlign: 'center', marginTop: 20, fontSize: 16 }
});