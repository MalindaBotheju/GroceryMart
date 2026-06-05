import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';
import BackgroundWrapper from '../components/BackgroundWrapper'; 

// Make sure to pass the API URL matching your network IP
const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth`; 

export default function VerifyOtpScreen({ route, navigation }) {
  // We expect the email to be passed from the previous screen
  const { email } = route.params || { email: '' }; 
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    try {
      setError('');
      const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      
      Alert.alert('Success!', 'Your email has been verified.');
      // Send them to Login so they can officially sign in
      navigation.replace('Login'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code.');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await axios.post(`${API_URL}/resend-otp`, { email });
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      setError('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <BackgroundWrapper>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Ionicons name="mail-unread" size={60} color="#4CAF50" style={styles.logo} />
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to {email ? `\n${email}` : 'your email'}.
          </Text>

          {error ? <Text style={styles.errorTextCenter}>{error}</Text> : null}

          <TextInput 
            style={styles.input} 
            placeholder="Enter 6-digit code" 
            value={otp}
            onChangeText={(text) => { setOtp(text.replace(/[^0-9]/g, '')); setError(''); }}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <TouchableOpacity style={styles.button} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify & Continue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleResend} disabled={isResending}>
            <Text style={[styles.linkText, isResending && { color: '#ccc' }]}>
              {isResending ? 'Sending...' : 'Didn\'t receive a code? Resend'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkTextBottom}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 30, borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  logo: { alignSelf: 'center', marginBottom: 5 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  input: { borderWidth: 2, borderColor: '#4CAF50', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 24, letterSpacing: 5, fontWeight: 'bold', color: '#333' },
  errorTextCenter: { color: '#f44336', fontSize: 14, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  button: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#2196F3', textAlign: 'center', marginTop: 25, fontSize: 16 },
  linkTextBottom: { color: '#666', textAlign: 'center', marginTop: 15, fontSize: 14 }
});