import React, { createContext, useState } from 'react';

// Create the Context
export const CartContext = createContext();

// Create a Provider Component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((currentCart) => {
      // Check if item is already in cart
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        // Increase quantity by 1 if it's already there
        return currentCart.map(item => 
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      // Add new item with a starting quantity of 1
      return [...currentCart, { ...product, cartQuantity: 1 }];
    });
  };

  // NEW: Function to empty the cart after a successful checkout
  const clearCart = () => {
    setCart([]);
  };

  return (
    // NEW: Added clearCart to the value object so screens can access it
    <CartContext.Provider value={{ cart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};