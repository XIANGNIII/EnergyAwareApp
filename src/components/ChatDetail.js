import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import BottomNavigation from './BottomNavigation';

const ChatDetail = ({ navigation, route }) => {
  const { chat } = route.params;
  
  // If no chat data, return empty view
  if (!chat) {
    return (
      <View style={styles.container}>
        <Text>No chat data available</Text>
      </View>
    );
  }
  
  const formatDate = (timestamp) => {
    // Check if timestamp exists
    if (!timestamp) {
      return 'No date available';
    }
    
    // If string, convert to Date object
    let date = timestamp;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    }
    
    // Ensure valid Date object
    if (!(date instanceof Date) || isNaN(date)) {
      return 'Invalid date';
    }
    
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} | ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };
  
  // Check if chat has messages
  const hasMessages = chat.messages && chat.messages.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.timestamp}>{formatDate(chat.lastTimestamp || chat.timestamp)}</Text>
          <Text style={styles.model}>Model: {chat.model}</Text>
        </View>
        
        <View style={styles.tokenInfoContainer}>
          <View style={styles.tokenInfoItem}>
            <Text style={styles.tokenLabel}>User Tokens</Text>
            <Text style={styles.tokenValue}>{chat.totalUserTokens || 0}</Text>
          </View>
          <View style={styles.tokenInfoItem}>
            <Text style={styles.tokenLabel}>AI Tokens</Text>
            <Text style={styles.tokenValue}>{chat.totalAiTokens || 0}</Text>
          </View>
          <View style={styles.tokenInfoItem}>
            <Text style={styles.tokenLabel}>Total</Text>
            <Text style={styles.tokenValue}>{chat.totalTokens || 0}</Text>
          </View>
        </View>
        
        <View style={styles.energyInfoContainer}>
          <Text style={styles.energyLabel}>Total Energy Used</Text>
          <Text style={styles.energyValue}>
            {(chat.totalEnergy || 0).toFixed(4)} Wh
          </Text>
        </View>
        
        <View style={styles.messageContainer}>
          {hasMessages ? (
            chat.messages.map((message, index) => (
              <React.Fragment key={index}>
                <View style={[styles.messageBubble, styles.userBubble]}>
                  <Text style={styles.messageText}>{message.userInput}</Text>
                </View>
                
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <Text style={styles.messageText}>{message.aiResponse}</Text>
                </View>
              </React.Fragment>
            ))
          ) : (
            // If messages array is empty, try to display top-level lastUserInput (as fallback)
            <React.Fragment>
              <View style={[styles.messageBubble, styles.userBubble]}>
                <Text style={styles.messageText}>{chat.lastUserInput || 'No user input found'}</Text>
              </View>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <Text style={styles.messageText}>{chat.lastAiResponse || 'No AI response found'}</Text>
              </View>
            </React.Fragment>
          )}
        </View>
      </ScrollView>
      
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  model: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenInfoContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  tokenInfoItem: {
    alignItems: 'center',
  },
  tokenLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  tokenValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  energyInfoContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#e3f2fd',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  energyLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  energyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
  },
  messageContainer: {
    padding: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  aiBubble: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  }
});

export default ChatDetail;