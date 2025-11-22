import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { EnergyContext } from '../context/EnergyContext';
import BottomNavigation from './BottomNavigation';
import PurposeDropdown from './PurposeDropdown';
import PickerWheel from './PickerWheel';

const ModelSelection = ({ navigation, onStartChatting }) => {
  const { setSelectedModel, setCurrentPurpose } = useContext(EnergyContext);
  const [purpose, setPurpose] = useState('Daily Questions');
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);

  const purposes = [
    'Academic Writing',
    'Daily Questions',
    'Programming',
    'Custom Options',
  ];

  // Define available models for each purpose
  const modelOptions = useMemo(() => ({
    'Daily Questions': [
      { model: 'GPT-4o Mini', energy: 0.5 },
      { model: 'GPT-4o', energy: 0.42 }
    ],
    'Academic Writing': [
      { model: 'GPT-4o', energy: 1.788 },
      { model: 'GPT-5', energy: 30.495 }
    ],
    'Programming': [
      { model: 'GPT-4o', energy: 1.788 },
      { model: 'GPT-4.5 Turbo', energy: 30.495 }
    ],
    'Custom Options': [
      { model: 'GPT-4o Mini', energy: 0.5 },
      { model: 'GPT-4o', energy: 0.42 },
      { model: 'GPT-4.5 Turbo', energy: 7.62 }, // Approx for short/med
      { model: 'GPT-5', energy: 7.62 }
    ]
  }), []);

  const currentOptions = useMemo(() => {
    return modelOptions[purpose] || modelOptions['Daily Questions'];
  }, [purpose, modelOptions]);

  // Reset selection when purpose changes
  useEffect(() => {
    setSelectedModelIndex(0);
  }, [purpose]);

  const getEnergyLevelLabel = (energy) => {
    if (energy <= 1.0) return 'Low';
    if (energy <= 10.0) return 'Medium';
    return 'High';
  };

  const getEnergyColorFromValue = (energy) => {
    if (energy <= 1.0) {
      return '#1fb28a'; // Green
    } else if (energy <= 10.0) {
      return '#FFB74D'; // Yellow
    } else {
      return '#F44336'; // Red
    }
  };

  // For PickerWheel: get color based on item index
  const getEnergyColor = (index) => {
    const option = currentOptions[index];
    return option ? getEnergyColorFromValue(option.energy) : '#666';
  };

  // For PickerWheel: get info based on item index
  const getModelInfo = (index) => {
    const option = currentOptions[index];
    if (!option) return null;
    return {
      model: option.model,
      energy: option.energy,
      energyLevel: getEnergyLevelLabel(option.energy)
    };
  };

  const pickerItems = useMemo(() => {
    return currentOptions.map((_, index) => ({ value: index }));
  }, [currentOptions]);

  const currentRecommendation = currentOptions[selectedModelIndex] || currentOptions[0];
  const currentEnergyLevel = getEnergyLevelLabel(currentRecommendation.energy);

  const handleStartChatting = () => {
    setSelectedModel(currentRecommendation.model);
    setCurrentPurpose(purpose);
    
    if (onStartChatting) {
      onStartChatting();
    } else {
      navigation.navigate('ChatScreen', { startNew: true });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select the purpose of your conversation</Text>

          {/* Purpose Dropdown */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Purpose</Text>
            <PurposeDropdown
              selectedPurpose={purpose}
              onSelect={setPurpose}
              purposes={purposes}
            />
          </View>

          {/* Model Picker Wheel */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Model Selection</Text>
            <PickerWheel
              items={pickerItems}
              selectedIndex={selectedModelIndex}
              onValueChange={setSelectedModelIndex}
              getModelInfo={getModelInfo}
              getEnergyColor={getEnergyColor}
            />
          </View>

          {/* Current Selection Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Recommended Model:</Text>
              <Text style={[
                styles.summaryValue,
                { color: getEnergyColorFromValue(currentRecommendation.energy) }
              ]}>
                {currentRecommendation.model}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Energy Impact:</Text>
              <Text style={[
                styles.summaryValue,
                { color: getEnergyColorFromValue(currentRecommendation.energy) }
              ]}>
                {currentEnergyLevel}
              </Text>
            </View>
          </View>

          {/* Start Chatting Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartChatting}
            activeOpacity={0.7}
          >
            <Text style={styles.startButtonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15, // Reduced padding (20 -> 15)
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10, // Reduced margin (20 -> 10)
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 10, // Reduced margin (20 -> 10)
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5, // Reduced margin (10 -> 5)
    color: '#666',
  },
  summaryContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15, // Reduced margin (20 -> 15)
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    width: '100%',
    backgroundColor: '#1fb28a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModelSelection;