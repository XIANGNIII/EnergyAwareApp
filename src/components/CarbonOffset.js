import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Modal, Alert, Platform, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import ViewShot, { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import { EnergyContext } from '../context/EnergyContext';
import TodoCheckboxIcon from './icons/TodoCheckboxIcon';
import TodoCheckboxCheckedIcon from './icons/TodoCheckboxCheckedIcon';
import DeleteIcon from './icons/DeleteIcon';
import ShuffleIcon from './icons/ShuffleIcon';
import ShareIcon from './icons/ShareIcon'; // New icon import
import EnergyCircle from './EnergyCircle';
import BottomNavigation from './BottomNavigation';

const CarbonOffset = ({ navigation }) => {
  const { offsetEnergy, addOffsetAction, totalEnergy, dailyEnergyGoal } = useContext(EnergyContext);
  const viewShotRef = useRef();
  
  // All available energy-saving suggestions
  const allSuggestions = [
    // Regular Carbon Offset Suggestions
    { id: '1', name: 'Use public transport instead of driving', energyOffset: 15.5, color: '#E3F2FD', type: 'offset' },
    { id: '2', name: 'Keep only one room lit at night', energyOffset: 8.2, color: '#FFF9C4', type: 'offset' },
    { id: '3', name: 'Take stairs instead of elevator', energyOffset: 2.1, color: '#F3E5F5', type: 'offset' },
    { id: '4', name: 'Reduce or turn off air conditioning', energyOffset: 25.8, color: '#E0F2F1', type: 'offset' },
    { id: '5', name: 'Walk for short distances', energyOffset: 0.5, color: '#E8F5E9', type: 'offset' },
    { id: '6', name: 'Ride a bicycle', energyOffset: 3.2, color: '#E1F5FE', type: 'offset' },
    { id: '7', name: 'Use public transportation', energyOffset: 12.4, color: '#FCE4EC', type: 'offset' },
    { id: '8', name: 'Carpool with others', energyOffset: 9.6, color: '#FFF3E0', type: 'offset' },
    { id: '9', name: 'Unplug unused electronics', energyOffset: 5.3, color: '#F1F8E9', type: 'offset' },
    { id: '10', name: 'Use natural light during day', energyOffset: 4.7, color: '#FFF8E1', type: 'offset' },
    { id: '11', name: 'Wash clothes in cold water', energyOffset: 6.8, color: '#E8EAF6', type: 'offset' },
    { id: '12', name: 'Air dry clothes instead of dryer', energyOffset: 11.2, color: '#F9FBE7', type: 'offset' },
    
    // AI Energy Saving Suggestions (Special)
    { 
      id: 'ai-1', 
      name: 'Batch your questions', 
      detail: 'Combining multiple questions into a single prompt reduces the number of requests and processing overhead, saving significant energy.',
      type: 'ai_saving' 
    },
    { 
      id: 'ai-2', 
      name: 'Use concise prompts', 
      detail: 'Clear and direct prompts help the AI model process your request more efficiently, reducing computation time and energy usage.',
      type: 'ai_saving' 
    },
    { 
      id: 'ai-3', 
      name: 'Choose smaller models', 
      detail: 'For simple tasks like daily questions, using GPT-4o Mini instead of larger models can save up to 10x energy.',
      type: 'ai_saving' 
    },
    { 
      id: 'ai-4', 
      name: 'Avoid redundant follow-ups', 
      detail: 'Try to ask for all necessary details in the initial prompt to avoid a long chain of follow-up queries, which consumes more energy.',
      type: 'ai_saving' 
    },
    { 
      id: 'ai-5', 
      name: 'Edit, don\'t regenerate', 
      detail: 'If a response isn\'t quite right, edit your prompt and save instead of regenerating from scratch. This provides better context with less compute.',
      type: 'ai_saving' 
    },
    { 
      id: 'ai-6', 
      name: 'Check history first', 
      detail: 'Before asking a new question, check your chat history. The answer might already be there, saving a completely new query!',
      type: 'ai_saving' 
    },
    { 
      id: 'ai-7', 
      name: 'Draft offline', 
      detail: 'Draft complex prompts in a notes app first. Sending a polished prompt reduces the need for multiple clarifications and retries.',
      type: 'ai_saving' 
    },
    { 
      id: 'ai-8', 
      name: 'Summarize efficiently', 
      detail: 'Ask for summaries of specific sections rather than pasting entire documents. Fewer input tokens mean significantly less energy consumption.',
      type: 'ai_saving' 
    },
  ];
  
  const [suggestions, setSuggestions] = useState([...allSuggestions].sort(() => Math.random() - 0.5).slice(0, 4));
  const [todoList, setTodoList] = useState([]);
  const [selectedAiSuggestion, setSelectedAiSuggestion] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Get today's date string (YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };
  
  // Check if it's a new day, if so, clear the to-do list
  useEffect(() => {
    const checkAndResetTodoList = async () => {
      try {
        const lastDate = await AsyncStorage.getItem('carbonOffsetLastDate');
        const today = getTodayString();
        
        if (lastDate !== today) {
          // New day, clear to-do list
          setTodoList([]);
          await AsyncStorage.setItem('carbonOffsetLastDate', today);
          await AsyncStorage.removeItem('carbonOffsetTodoList');
    } else {
          // Same day, try to load saved to-do list
          const savedTodoList = await AsyncStorage.getItem('carbonOffsetTodoList');
          if (savedTodoList) {
            setTodoList(JSON.parse(savedTodoList));
          }
        }
      } catch (error) {
        console.error('Error checking date:', error);
      }
    };
    
    checkAndResetTodoList();
  }, []);
      
  // Save to-do list to AsyncStorage
  useEffect(() => {
    const saveTodoList = async () => {
      try {
        await AsyncStorage.setItem('carbonOffsetTodoList', JSON.stringify(todoList));
      } catch (error) {
        console.error('Error saving todo list:', error);
      }
    };
    
    if (todoList.length > 0 || todoList.length === 0) {
      saveTodoList();
    }
  }, [todoList]);
  
  // Shuffle suggestions list, show only 4
  const shuffleSuggestions = () => {
    // Filter out items that are already in the todo list
    const available = allSuggestions.filter(s => !todoList.some(t => t.id === s.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 4);
    setSuggestions(shuffled);
  };
  
  // Add suggestion to to-do list
  const addToTodoList = (suggestion) => {
    // Check if already in to-do list
    if (!todoList.find(item => item.id === suggestion.id)) {
      const newTodoItem = {
        ...suggestion,
        completed: false,
        todoId: Date.now().toString() // Create unique ID for to-do list item
      };
      
      // Update To-Do List
      const newTodoList = [...todoList, newTodoItem];
      setTodoList(newTodoList);
      
      // Remove from suggestions and refill
      replaceSuggestionInView(suggestion.id, newTodoList);
    }
  };

  // Helper to replace a suggestion in the current view
  const replaceSuggestionInView = (removedId, currentTodoList) => {
    const filteredSuggestions = suggestions.filter(s => s.id !== removedId);
    
    // Exclude currently shown suggestions and items in the todo list
    const shownIds = new Set(filteredSuggestions.map(s => s.id));
    const todoIds = new Set(currentTodoList.map(t => t.id));
    
    const candidates = allSuggestions.filter(s => !shownIds.has(s.id) && !todoIds.has(s.id));
    
    if (candidates.length > 0) {
        const randomReplacement = candidates[Math.floor(Math.random() * candidates.length)];
        filteredSuggestions.push(randomReplacement);
    }
    
    setSuggestions(filteredSuggestions);
  };

  // Handle "Got it" action for AI suggestions
  const handleDismissAiSuggestion = () => {
    if (!selectedAiSuggestion) return;

    // Remove the dismissed suggestion from the current view
    // Note: AI suggestions are not in todoList, so we pass current todoList for exclusion check
    replaceSuggestionInView(selectedAiSuggestion.id, todoList);
    setSelectedAiSuggestion(null);
  };

  const handleSuggestionPress = (item) => {
    if (item.type === 'ai_saving') {
      // Show details for AI suggestion
      setSelectedAiSuggestion(item);
    } else {
      // Regular behavior: add to todo list
      const isInTodoList = todoList.some(todo => todo.id === item.id);
      if (!isInTodoList) {
        addToTodoList(item);
      }
    }
  };
  
  // Toggle completion status of to-do list item, move completed items to end
  const toggleTodoItem = (todoId) => {
    setTodoList(prevList => {
      const updatedList = prevList.map(item => {
        if (item.todoId === todoId) {
          const wasCompleted = item.completed;
          const newCompleted = !wasCompleted;
          
          // If changing from incomplete to complete, add offset amount
          if (!wasCompleted && newCompleted && item.energyOffset) {
            addOffsetAction(item.name, item.energyOffset);
          }
          
          return { ...item, completed: newCompleted };
        }
        return item;
      });
      
      // Sort: incomplete items first, then completed items
      const incomplete = updatedList.filter(item => !item.completed);
      const completed = updatedList.filter(item => item.completed);
      
      return [...incomplete, ...completed];
    });
  };
  
  // Remove item from to-do list
  const removeFromTodoList = (todoId) => {
    setTodoList(todoList.filter(item => item.todoId !== todoId));
  };

  // Share function
  const handleShare = async () => {
    try {
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 0.9,
      });
      
      await Share.open({
        url: uri,
        message: 'Check out my energy saving impact with EnergyAwareChat!',
        title: 'My Energy Impact'
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };
  
  // Render suggestion bubbles
  const renderSuggestionBubble = ({ item, index }) => {
    const isInTodoList = item.type !== 'ai_saving' && todoList.some(todo => todo.id === item.id);
    const isAiType = item.type === 'ai_saving';
    
    return (
      <TouchableOpacity 
        style={[
          styles.suggestionBubble,
          !isAiType && { backgroundColor: item.color || '#E3F2FD' },
          // isAiType handled by SVG below
          isAiType && styles.aiBubbleContainer,
          index % 2 === 0 ? styles.bubbleLeft : styles.bubbleRight,
          isInTodoList && styles.bubbleDisabled
        ]}
        onPress={() => handleSuggestionPress(item)}
        disabled={isInTodoList}
        activeOpacity={0.8}
      >
        {isAiType && (
          <View style={StyleSheet.absoluteFill}>
            <Svg height="100%" width="100%" style={{ borderRadius: 20 }}>
              <Defs>
                <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#E3F2FD" stopOpacity="1" />
                  <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#FCE4EC" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" rx="20" ry="20" />
            </Svg>
          </View>
        )}
        <Text style={[
          styles.bubbleText,
          isAiType && styles.aiBubbleText
        ]}>
          {item.name}
        </Text>
        {isAiType && (
          <View style={styles.aiTagContainer}>
            <Text style={styles.aiTag}>AI TIP</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Render to-do list items
  const renderTodoItem = ({ item }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.todoCheckbox}
        onPress={() => toggleTodoItem(item.todoId)}
      >
        {item.completed ? (
          <TodoCheckboxCheckedIcon size={24} color="#2E4454" />
        ) : (
          <TodoCheckboxIcon size={24} color="#666" />
        )}
      </TouchableOpacity>
      <View style={styles.todoContent}>
        <Text style={[
          styles.todoName,
          item.completed && styles.todoNameCompleted
        ]}>
          {item.name}
        </Text>
        <Text style={styles.todoEnergy}>Saves ~{item.energyOffset.toFixed(1)} Wh</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromTodoList(item.todoId)}
      >
        <DeleteIcon size={20} color="#828282" />
    </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Your Offset Section - Top */}
        <View style={styles.offsetContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.offsetTitle}>Your Offset</Text>
            <TouchableOpacity 
              style={styles.shareHeaderButton}
              onPress={() => setShowShareModal(true)}
            >
              <ShareIcon size={30} color="#1fb28a" />
            </TouchableOpacity>
          </View>
          
          <EnergyCircle
            primaryValue={offsetEnergy}
            primaryLabel="Offset"
            secondaryValue={totalEnergy}
            secondaryLabel="Usage"
            primaryColor="#1fb28a"
            secondaryColor="#E3F2FD"
            size={180}
            variant="offset"
            dailyGoal={dailyEnergyGoal || 300}
          />
        </View>
        
        {/* Suggestions Section - Middle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Energy Saving Suggestions</Text>
            <TouchableOpacity 
              style={styles.shuffleButton}
              onPress={shuffleSuggestions}
            >
              <ShuffleIcon size={20} color="#1fb28a" />
              <Text style={styles.shuffleButtonText}>Shuffle</Text>
        </TouchableOpacity>
      </View>
          <View style={styles.bubblesContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionBubble}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.bubbleRow}
            />
          </View>
        </View>
        
        {/* To-Do List Section - Bottom */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My To-Do List</Text>
          {todoList.length === 0 ? (
            <View style={styles.emptyTodo}>
              <Text style={styles.emptyTodoText}>No items yet. Add suggestions above!</Text>
            </View>
          ) : (
            <FlatList
              data={todoList}
              renderItem={renderTodoItem}
              keyExtractor={item => item.todoId}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
      
      <BottomNavigation />

      {/* AI Suggestion Modal */}
      <Modal
        visible={!!selectedAiSuggestion}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedAiSuggestion(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent, 
            selectedAiSuggestion?.type === 'ai_saving' && {
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#F3E5F5',
              shadowColor: '#B39DDB',
              shadowOpacity: 0.4,
              shadowRadius: 15,
            }
          ]}>
            {selectedAiSuggestion?.type === 'ai_saving' && (
              <View style={StyleSheet.absoluteFill}>
                <Svg height="100%" width="100%" style={{ borderRadius: 20 }}>
                  <Defs>
                    <LinearGradient id="modalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#E3F2FD" stopOpacity="0.5" />
                      <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                      <Stop offset="100%" stopColor="#FCE4EC" stopOpacity="0.5" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="100%" height="100%" fill="url(#modalGrad)" rx="20" ry="20" />
                </Svg>
              </View>
            )}
            
            <Text style={styles.modalTitle}>{selectedAiSuggestion?.name}</Text>
            <Text style={styles.modalDetail}>{selectedAiSuggestion?.detail}</Text>
            
            <TouchableOpacity 
              style={styles.gotItButton}
              onPress={handleDismissAiSuggestion}
              activeOpacity={0.6}
            >
              <Text style={styles.gotItButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContent}>
            <View style={styles.shareHeader}>
              <Text style={styles.shareTitle}>Share Your Impact</Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            {/* Card to be captured - Ensure immediate render for fake data capture */}
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.shareCardContainer}>
              <View style={styles.shareCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.appName}>EnergyAwareChat</Text>
                  <Text style={styles.cardDate}>{new Date().toLocaleDateString()}</Text>
                </View>
                
                {/* Main Content */}
                <View style={styles.cardMain}>
                  <View style={styles.statBlock}>
                    <Text style={styles.impactLabel}>ENERGY USAGE</Text>
                    <Text style={styles.impactValue}>{totalEnergy > 0 ? totalEnergy.toFixed(2) : "154.30"} <Text style={styles.impactUnit}>Wh</Text></Text>
                  </View>
                  
                  <View style={styles.statDivider} />
                  
                  <View style={styles.statBlock}>
                    <Text style={[styles.impactLabel, { color: '#1fb28a' }]}>OFFSET ACHIEVED</Text>
                    <Text style={[styles.impactValue, { color: '#1fb28a' }]}>{offsetEnergy > 0 ? offsetEnergy.toFixed(2) : "192.00"} <Text style={styles.impactUnit}>Wh</Text></Text>
                  </View>
                </View>
                
                {/* Top Tasks */}
                <View style={styles.cardTasks}>
                  <Text style={styles.tasksTitle}>Top Actions Taken</Text>
                  {/* Fake data if real data is empty, for better visual */}
                  {(todoList.filter(t => t.completed).length > 0 ? todoList.filter(t => t.completed).slice(0, 3) : [
                    { name: "Used public transport instead of driving" },
                    { name: "Reduced air conditioning usage" },
                    { name: "Unplugged unused electronics" }
                  ]).map((task, i) => (
                    <View key={i} style={styles.taskRow}>
                      <View style={styles.checkCircle} />
                      <Text style={styles.taskText} numberOfLines={1}>{task.name}</Text>
                    </View>
                  ))}
                </View>
                
                {/* Footer */}
                <View style={styles.cardFooter}>
                  <Text style={styles.footerText}>Reducing AI carbon footprint, one chat at a time.</Text>
                </View>
              </View>
            </ViewShot>
            
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Share Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 20
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1fb28a'
  },
  shuffleButtonText: {
    marginLeft: 5,
    color: '#1fb28a',
    fontSize: 14,
    fontWeight: '500'
  },
  bubblesContainer: {
    marginTop: 10
  },
  bubbleRow: {
    justifyContent: 'space-between',
    marginBottom: 12
  },
  suggestionBubble: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  bubbleLeft: {
    alignSelf: 'flex-start'
  },
  bubbleRight: {
    alignSelf: 'flex-end'
  },
  aiBubbleContainer: {
    borderWidth: 1,
    borderColor: '#F0F0F0', // Very subtle border
    shadowColor: '#B39DDB', // Soft purple shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    backgroundColor: 'transparent', // Important for SVG
    overflow: 'hidden', // Ensure SVG doesn't bleed, though radius handles it
  },
  aiBubbleText: {
    color: '#2c3e50', // Dark slate/navy for elegance
    fontWeight: '600',
    zIndex: 1, // Ensure text is above SVG
  },
  aiTagContainer: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Frosted glass feel
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },
  aiTag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#5C6BC0', // Soft indigo
    letterSpacing: 1
  },
  bubbleDisabled: {
    opacity: 0.5
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
    lineHeight: 18
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  todoCheckbox: {
    marginRight: 12
  },
  todoContent: {
    flex: 1
  },
  todoName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4
  },
  todoNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#999'
  },
  todoEnergy: {
    fontSize: 13,
    color: '#666'
  },
  removeButton: {
    padding: 8
  },
  emptyTodo: {
    padding: 20,
    alignItems: 'center'
  },
  emptyTodoText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic'
  },
  offsetContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10
  },
  offsetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareHeaderButton: {
    padding: 8,
  },
  shareHeaderText: {
    color: '#1fb28a',
    fontSize: 16,
    fontWeight: '600'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '90%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    backgroundColor: '#fff', // Default bg
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalDetail: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25
  },
  gotItButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  gotItButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600'
  },
  // Share Modal Styles
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    maxHeight: '90%',
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center'
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    padding: 5
  },
  shareCardContainer: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fff', // Ensure white bg for capture
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  shareCard: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    backgroundColor: '#fff', // Ensure background color is set
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1fb28a',
    letterSpacing: 1,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  cardMain: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statBlock: {
    alignItems: 'center',
    marginBottom: 10,
  },
  statDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  impactLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  impactValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#333',
  },
  impactUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  cardTasks: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    flex: 1,
    marginBottom: 15,
  },
  tasksTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#1fb28a',
    marginRight: 10,
  },
  taskText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
    fontWeight: '500',
  },
  cardFooter: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  shareButton: {
    backgroundColor: '#1fb28a',
    width: '100%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default CarbonOffset;