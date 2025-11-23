import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { EnergyContext } from '../context/EnergyContext';
import { sendMessage } from '../utils/apiService';
import SendIcon from './icons/SendIcon';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initializedRef = useRef(false);
  
  const {
    selectedModel,
    addChatRecord,
    startNewChat,
    currentChatId,
    setCurrentChatId,
    currentPurpose
  } = useContext(EnergyContext);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  

  // Handle initialization and message loading
  // useEffect(() => {
  //   if (initializedRef.current) return;
  //   initializedRef.current = true;
    
  //   if (route.params?.selectedChat) {
  //     const { id, messages } = route.params.selectedChat;
      
  //     if (id) {
  //       setCurrentChatId(id);
  //     }
      
  //     if (messages && messages.length > 0) {
  //       const formattedMessages = messages.flatMap((msg, index) => [
  //         {
  //           id: `user-${index}`,
  //           content: msg.userInput,
  //           isUser: true
  //         },
  //         {
  //           id: `ai-${index}`,
  //           content: msg.aiResponse,
  //           isUser: false
  //         }
  //       ]);
        
  //       setMessages(formattedMessages);
  //     }
  //   } else {
  //     // If not from chat history, start new chat
  //     startNewChat();
  //   }
    
  //   initializedRef.current = true;
  // }, []); // Empty dependency array, execute only once on mount
  useFocusEffect(
    useCallback(() => {
      // Check if navigated from ModelSelection (we added startNew parameter)
      if (route.params?.startNew) {
        // This is a new chat
        startNewChat(); // Create new ID in Context
        setMessages([]);  // Clear local message state
        
        // Clear navigation params to prevent triggering again on next focus
        navigation.setParams({ startNew: null });
      }
      
      // Check if navigated from chat history (if you plan to implement this feature)
      // Note: Current ChatHistory.js navigates to ChatDetail, not here.
      // This logic will only be triggered if you modify ChatHistory.js to navigate here.
      else if (route.params?.selectedChat) {
        const { id, messages } = route.params.selectedChat;
        
        if (id) {
          setCurrentChatId(id);
        }
        
        if (messages && messages.length > 0) {
          const formattedMessages = messages.flatMap((msg, index) => [
            { id: `user-${index}`, content: msg.userInput, isUser: true },
            { id: `ai-${index}`, content: msg.aiResponse, isUser: false }
          ]);
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
        
        // Clear navigation params
        navigation.setParams({ selectedChat: null });
      }
      
      // If no params (e.g., just switching tab back), do nothing, keep current state
      
    }, [route.params, navigation, setCurrentChatId, startNewChat])
  );
  
  // Auto scroll to bottom
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      content: inputText,
      isUser: true
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Use actual API
      const response = await sendMessage(inputText, selectedModel);
      
      const aiMessage = {
        id: `ai-${Date.now()}`,
        content: response,
        isUser: false
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      addChatRecord(userMessage.content, aiMessage.content, selectedModel, currentPurpose);
      
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        content: "Error connecting to ChatGPT service. Please try again later.",
        isUser: false,
        isError: true
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderMessageItem = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.isUser ? styles.userBubble : styles.aiBubble,
      item.isError && styles.errorBubble
    ]}>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );
  
  // Component render section
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.modelInfo}>
          <Text style={styles.modelText}>Model: {selectedModel || '-'}</Text>
        </View>

        <View style={styles.messageContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item, index) => item.id ? String(item.id) : `item-${index}`}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            onContentSizeChange={() => {
              if (flatListRef.current && messages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
            onLayout={() => {
              if (flatListRef.current && messages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message"
            multiline
          />
          {isLoading ? (
            <ActivityIndicator size="small" color="#1fb28a" style={styles.sendButton} />
          ) : (
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <SendIcon size={30} color="#1fb28a" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  keyboardView: {
    flex: 1
  },
  modelInfo: {
    paddingHorizontal: 15, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0'
  },
  modelText: { fontSize: 14, color: '#666' },
  messageContainer: { flex: 1, width: '100%' },
  messageList: { paddingHorizontal: 15, paddingVertical: 10 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 18, marginVertical: 5 },
  userBubble: { backgroundColor: '#e3f2fd', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  aiBubble: { backgroundColor: '#f0f0f0', alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
  errorBubble: { backgroundColor: '#ffebee' },
  messageText: { fontSize: 16, lineHeight: 22 },
  inputContainer: {
    flexDirection: 'row', padding: 10,
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  textInput: {
    flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20,
    paddingHorizontal: 15, paddingVertical: 8, maxHeight: 100, fontSize: 16
  },
  sendButton: { marginLeft: 10, padding: 5 }
});

export default ChatScreen;