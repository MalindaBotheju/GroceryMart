import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';
import BackgroundWrapper from '../components/BackgroundWrapper'; 

// Using your local network IP matching your other screens
const API_URL = 'http://10.29.171.206:5000/api/auth'; 

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // Step 1: Request Code | Step 2: Verify & Change Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Error States
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Step 1: Request Reset Code via Email
  const handleRequestCode = async () => {
    if (!email) {
      setEmailError('Please enter your email address.');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email format.');
      return;
    }

    try {
      setEmailError('');
      setGeneralError('');
      
      await axios.post(`${API_URL}/forgot-password`, { email });
      
      Alert.alert('Code Sent!', 'Check your email inbox for your 6-digit security reset code.');
      setStep(2); // Advance the UI layer to entry step
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send reset code. Please try again.';
      setGeneralError(errorMsg);
    }
  };

  // Step 2: Verify Code and Save New Password
  const handleResetPassword = async () => {
    let isValid = true;
    setOtpError('');
    setPasswordError('');
    setGeneralError('');

    if (otp.length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      isValid = false;
    }
    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      isValid = false;
    } else if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    if (!isValid) return;

    try {
      await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
      
      Alert.alert('Success!', 'Your password has been securely updated. You can now log in.');
      navigation.navigate('Login');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Invalid reset code or server error.';
      setGeneralError(errorMsg);
    }
  };

  return (
    <BackgroundWrapper>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Ionicons name="keypad" size={60} color="#4CAF50" style={styles.logo} />
            <Text style={styles.title}>Reset Password</Text>

            {generalError ? <Text style={styles.errorTextCenter}>{generalError}</Text> : null}

            {step === 1 ? (
              // --- STEP 1: Email Form ---
              <View>
                <Text style={styles.subtitle}>
                  Enter your email address and we will send you a 6-digit security code to update your password.
                </Text>

                <TextInput 
                  style={[styles.input, emailError ? styles.inputError : null]} 
                  placeholder="Email" 
                  value={email}
                  onChangeText={(text) => { setEmail(text); setEmailError(''); setGeneralError(''); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleRequestCode}>
                  <Text style={styles.buttonText}>Send Reset Code</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // --- STEP 2: Code & New Password Form ---
              <View>
                <Text style={styles.subtitle}>
                  Enter the 6-digit code sent to your email and type your new account password.
                </Text>

                <TextInput 
                  style={[styles.input, otpError ? styles.inputError : null]} 
                  placeholder="6-Digit Reset Code" 
                  value={otp}
                  onChangeText={(text) => { setOtp(text.replace(/[^0-9]/g, '')); setOtpError(''); setGeneralError(''); }}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

                <TextInput 
                  style={[styles.input, passwordError ? styles.inputError : null]} 
                  placeholder="New Password (Min. 6 chars)" 
                  secureTextEntry
                  value={newPassword}
                  onChangeText={(text) => { setNewPassword(text); setPasswordError(''); setGeneralError(''); }}
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                  <Text style={styles.buttonText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 5, fontSize: 16 },
  inputError: { borderColor: '#f44336', borderWidth: 1.5 },
  errorText: { color: '#f44336', fontSize: 13, marginBottom: 10, marginLeft: 5 },
  errorTextCenter: { color: '#f44336', fontSize: 14, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  button: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#2196F3', textAlign: 'center', marginTop: 25, fontSize: 16 }
});