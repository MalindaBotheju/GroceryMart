import React, { useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { AuthContext } from '../AuthContext';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function ProfileScreen({ navigation }) {
  // Grab the user data and the logout function from global memory
  const { user, logout } = useContext(AuthContext);

  // Hide the default navigation header so we can use our custom one
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleLogout = () => {
    logout(); // Clear the global state
    navigation.replace('Login'); // Send them back to the login screen
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        
        {/* CUSTOM GREEN HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          {/* If the user exists, show their sleek info card */}
          {user ? (
            <View style={styles.infoCard}>
              {/* Floating Avatar */}
              <View style={styles.avatarWrapper}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{user.name}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email Address</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>

              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Account Role</Text>
                <Text style={styles.value}>{user.role}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.value}>No user data found.</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.ordersButton]} 
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <Ionicons name="receipt-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>View My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.logoutButton]} 
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'rgba(255, 255, 255, 0.4)' // Matches Home and Cart screens
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
    width: 40, // Keeps the title perfectly centered
  },

  // CONTENT & CARD STYLES
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: -60, // Makes the avatar pop out of the top of the card
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  infoCard: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 25, 
    paddingBottom: 25,
    borderRadius: 20, 
    width: '100%', 
    marginTop: 80, // Leaves room for the floating avatar
    marginBottom: 30, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 5 
  },
  infoRow: {
    marginTop: 15,
  },
  label: { 
    fontSize: 13, 
    color: '#888', 
    fontWeight: '600',
    marginBottom: 4,
  },
  value: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 15,
  },
  
  // UNIFIED PILL BUTTON STYLES
  buttonContainer: {
    width: '100%',
  },
  button: { 
    flexDirection: 'row',
    paddingVertical: 14, 
    borderRadius: 30, 
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  ordersButton: { 
    backgroundColor: '#4CAF50' 
  },
  logoutButton: { 
    backgroundColor: '#f44336' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});