import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = 40; // Reduced height for compactness
const VISIBLE_ITEMS = 5;

const PickerWheel = ({ 
  items, 
  selectedIndex, 
  onValueChange,
  getModelInfo,
  getEnergyColor 
}) => {
  const scrollViewRef = useRef(null);
  const isUserScrolling = useRef(false);

  useEffect(() => {
    // Only scroll programmatically if the user is not currently scrolling
    if (scrollViewRef.current && selectedIndex !== null && !isUserScrolling.current) {
      const offset = selectedIndex * ITEM_HEIGHT;
      scrollViewRef.current.scrollTo({
        y: offset,
        animated: true,
      });
    }
  }, [selectedIndex]);

  const handleScrollBeginDrag = () => {
    isUserScrolling.current = true;
  };

  const handleScrollEndDrag = (event) => {
    // If there is no momentum (velocity is low), we consider scrolling ended here
    // But usually it's better to rely on momentum end if there is momentum.
    // React Native doesn't always fire onMomentumScrollEnd if you drag and stop.
    // So we might need to check velocity or wait.
    // For simplicity, we'll let onMomentumScrollEnd handle the snap if possible,
    // but if user drags slowly and releases, momentum might not fire?
    // `snapToInterval` usually handles the physical snap.
    
    // We will keep isUserScrolling true until momentum ends to prevent jitter.
    // However, if no momentum, we need to reset.
    // Let's optimistically set it to false here if we want instantaneous updates, 
    // but that risks the jitter loop.
    
    // Safe approach: set it false in momentum end. 
    // If there is no momentum, this event might be the last one?
    // Actually, snapToInterval usually induces momentum.
  };

  const handleMomentumScrollEnd = (event) => {
    isUserScrolling.current = false;
    
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    if (clampedIndex !== selectedIndex) {
      onValueChange(clampedIndex);
    }
  };

  const handleScroll = (event) => {
    // Update value while scrolling to show highlight change, 
    // BUT parent update should NOT trigger useEffect scrollTo while isUserScrolling is true.
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    if (clampedIndex !== selectedIndex) {
      onValueChange(clampedIndex);
    }
  };

  const renderItem = (item, index) => {
    const isSelected = index === selectedIndex;
    const modelInfo = getModelInfo ? getModelInfo(item.value) : null;
    const energyColor = getEnergyColor ? getEnergyColor(item.value) : '#666';

    if (!modelInfo) return null;

    return (
      <View
        key={index}
        style={[
          styles.item,
          isSelected && styles.selectedItem,
        ]}
      >
        <View style={styles.itemContent}>
          {/* Model Name */}
          <Text style={[
            styles.itemText,
            isSelected && styles.selectedItemText,
            { color: isSelected ? energyColor : '#bbb' } 
          ]}>
            {modelInfo.model}
          </Text>
          
          {/* Energy Level */}
          <Text style={[
            styles.energyText,
            { color: isSelected ? energyColor : '#ddd', opacity: isSelected ? 1 : 0.6 }
          ]}>
            Energy: {modelInfo.energyLevel}
          </Text>
        </View>
      </View>
    );
  };

  const paddingTop = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);
  const paddingBottom = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

  return (
    <View style={styles.container}>
      <View style={styles.selectionIndicator} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop,
          paddingBottom,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {items.map((item, index) => renderItem(item, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: 'transparent', 
    zIndex: -1, 
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    // backgroundColor: 'transparent',
  },
  itemContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 16, // Reduced font size
    fontWeight: '500',
    marginBottom: 0, // Reduced margin
  },
  selectedItemText: {
    fontSize: 20, // Reduced selected font size
    fontWeight: '700',
  },
  energyText: {
    fontSize: 10, // Reduced font size
    fontWeight: '400',
  },
});

export default PickerWheel;