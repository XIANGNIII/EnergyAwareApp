import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform
} from 'react-native';
import { EnergyContext } from '../context/EnergyContext';
import MoreIcon from './icons/MoreIcon';
import BottomNavigation from './BottomNavigation';

const ChatHistory = ({ navigation }) => {
  const { chatHistory } = useContext(EnergyContext);
  
  const formatDate = (timestamp) => {
    if (typeof timestamp === 'string') {
      timestamp = new Date(timestamp);
    }
    return `${timestamp.getFullYear()}/${String(timestamp.getMonth() + 1).padStart(2, '0')}/${String(timestamp.getDate()).padStart(2, '0')} | ${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`;
  };
  
  const getEnergyColor = (energy) => {
    if (energy >= 100) {
      if (energy >= 200) {
        return '#F44336'; // Red
      } else {
        return '#FF9800'; // Orange
      }
    } else if (energy >= 50) {
      return '#FFB74D'; // Light orange
    } else if (energy >= 20) {
      return '#64B5F6'; // Light blue
    } else {
      return '#1fb28a'; // Theme green
    }
  };
  
  const handleChatPress = (item) => {
    navigation.navigate('ChatDetail', { chat: item });
  };
  
  const renderItem = ({ item, index }) => {
    const lastUserInput = item?.lastUserInput || item?.userInput || '';
    const preview = lastUserInput.length > 30 
      ? `${lastUserInput.substring(0, 30)}...` 
      : lastUserInput;
    
    const energyColor = getEnergyColor(item.totalEnergy || item.interactionEnergy || 0);

    return (
      <TouchableOpacity 
        style={styles.glassItem}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.historyHeader}>
          <View style={styles.energyCircle}>
            <View 
              style={[
                styles.energyIndicator, 
                { borderColor: energyColor }
              ]}
            >
              <Text style={[styles.chatIndex, { color: energyColor }]}>{index + 1}</Text>
            </View>
          </View>
          
          <View style={styles.historyContent}>
            <Text style={styles.historyTitle} numberOfLines={1}>
              {preview}
            </Text>
            <Text style={styles.historyDate}>
              {formatDate(item.lastTimestamp || item.timestamp)} 
              <Text style={styles.tokenInfo}> • {item.totalTokens || 0} tokens</Text>
            </Text>
          </View>
          
          <View style={styles.moreIconContainer}>
            <MoreIcon size={20} color="#8E8E93" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chatHistory.length > 0 ? chatHistory : []}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id ? item.id.toString() : `item-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No chat history yet.</Text>
            <Text style={styles.emptySubtext}>Start a conversation!</Text>
          </View>
        }
      />
      
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS Grouped Background Color
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for bottom nav
  },
  glassItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
    borderRadius: 16, // Rounded corners like iOS 26 style
    marginBottom: 12,
    padding: 16,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    // Android Elevation
    elevation: 2,
    // Border for glass effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  energyCircle: {
    marginRight: 16,
  },
  energyIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White bg for circle to pop
  },
  chatIndex: {
    fontWeight: '700',
    fontSize: 16,
  },
  historyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    letterSpacing: -0.4, // iOS style tight tracking
  },
  historyDate: {
    fontSize: 13,
    color: '#8E8E93', // iOS Secondary Label Color
    fontWeight: '400',
  },
  tokenInfo: {
    color: '#8E8E93',
  },
  moreIconContainer: {
    paddingLeft: 10,
    opacity: 0.6,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
  }
});

export default ChatHistory;