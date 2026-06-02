import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // NEW: Import AsyncStorage

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // NEW: Check for a saved user as soon as the app opens
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          setUser(JSON.parse(storedUser)); // Convert the string back into an object
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };
    loadUser();
  }, []);

  // NEW: Save the user to the device when they log in
  const login = async (userData) => {
    setUser(userData);
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user data", error);
    }
  };

  // NEW: Remove the user from the device when they log out
  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error("Failed to remove user data", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};