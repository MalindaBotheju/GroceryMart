import React, { useState, useEffect, useRef } from 'react';
import { ImageBackground, StyleSheet, View, FlatList, Dimensions } from 'react-native';

// Use 'screen' instead of 'window' to grab the completely full height, removing the bottom gap!
const { width, height } = Dimensions.get('screen');

// 5 High-Quality Grocery Images
const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1719528810377-98fa415026e4?auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1663047637139-2e19f85d9e1f?auto=format&fit=crop&w=800&q=80',
  'https://plus.unsplash.com/premium_photo-1683133454376-50848f9599c4?auto=format&fit=crop&w=800&q=80'
];

export default function BackgroundWrapper({ children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null); 

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      
      if (nextIndex >= BACKGROUND_IMAGES.length) {
        nextIndex = 0;
      }

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 10000); 
    
    return () => clearInterval(interval); 
  }, [currentIndex]); 

  return (
    <View style={styles.container}>
      {/* The invisible sliding carousel */}
      <FlatList
        ref={flatListRef}
        data={BACKGROUND_IMAGES}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        scrollEnabled={false} 
        showsHorizontalScrollIndicator={false}
        style={styles.absoluteCarousel} // FIXED: Added style here to stop the shifting behavior
        renderItem={({ item }) => (
          <ImageBackground
            source={{ uri: item }}
            style={{ width, height }} // Now perfectly matches the full screen
            blurRadius={1}
          />
        )}
      />

      {/* The semi-transparent overlay and your app's content */}
      <View style={styles.overlay}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#000', // Adds a black fallback behind the images just in case
  },
  absoluteCarousel: {
    ...StyleSheet.absoluteFillObject, // Locks the list structure firmly to the background layer
    position: 'absolute',             // Stops it from dynamically moving when content changes
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  }
});