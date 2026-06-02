import React, { useEffect, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';

export default function SplashScreen({ navigation }) {
  // Grab the user from your persistent storage context
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // We add a 2-second delay (2000ms) so the user actually has time 
    // to admire your new logo before it navigates away.
    const timer = setTimeout(() => {
      if (user) {
        navigation.replace('Home'); // Logged in? Go to store.
      } else {
        navigation.replace('Login'); // Not logged in? Go to login.
      }
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [user, navigation]);

  return (
    <View style={styles.container}>
      {/* The Logo Icon */}
      <Ionicons name="basket" size={110} color="#ffffff" style={styles.icon} />
      
      {/* The App Name */}
      <Text style={styles.title}>GroceryMart</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50', // The vibrant green from your reference
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1, // Adds a little premium spacing between letters
  },
});