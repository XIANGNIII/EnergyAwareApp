import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, InteractionManager, Modal, TextInput, Alert } from 'react-native';
import { EnergyContext } from '../context/EnergyContext';
import { LineChart } from 'react-native-chart-kit';
import EnergyCircle from './EnergyCircle';
import BottomNavigation from './BottomNavigation';

const screenWidth = Dimensions.get('window').width;

const EnergyReport = ({ navigation }) => {
  const { energyLog, totalEnergy, offsetEnergy, dailyEnergyGoal, setDailyEnergyGoal } = useContext(EnergyContext);
  const [selectedPeriod, setSelectedPeriod] = useState('Week');
  const [selectedItem, setSelectedItem] = useState('Week 1'); // Can be week, month, or year
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState(dailyEnergyGoal ? dailyEnergyGoal.toString() : '300');
  
  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Define options based on selected period
  const getPeriodOptions = () => {
    if (selectedPeriod === 'Week') {
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    } else if (selectedPeriod === 'Month') {
      return ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November'];
    } else { // Year
      // Show years from 2021 to current year (oldest to newest)
      return [
        '2021',
        '2022',
        '2023',
        '2024',
        currentYear.toString()
      ];
    }
  };
  
  const periodOptions = getPeriodOptions();
  
  // Set default selected item when period changes
  useEffect(() => {
    if (selectedPeriod === 'Week') {
      setSelectedItem('Week 1');
    } else if (selectedPeriod === 'Month') {
      setSelectedItem('November');
    } else { // Year
      setSelectedItem(currentYear.toString());
    }
  }, [selectedPeriod, currentYear]);
  
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    // Use abbreviated month names for chart X-axis labels
    const monthsAbbreviated = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    if (selectedPeriod === 'Week') {
      return {
        labels: daysOfWeek,
        datasets: [{
          data: [0.4, 0.7, 0.3, 0.5, 0.9, 0.6, 0.2],
          color: (opacity = 1) => `rgba(31, 178, 138, ${opacity})`,
        }]
      };
    } else if (selectedPeriod === 'Month') {
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          data: [2.1, 1.8, 2.3, 2.9],
          color: (opacity = 1) => `rgba(31, 178, 138, ${opacity})`,
        }]
      };
    } else { // Year
      return {
        labels: monthsAbbreviated,
        datasets: [{
          data: [8.3, 7.5, 9.2, 8.7, 10.1, 9.8, 9.5, 10.2],
          color: (opacity = 1) => `rgba(31, 178, 138, ${opacity})`,
        }]
      };
    }
  }, [selectedPeriod]);
  
  // Memoize chart width
  const chartWidth = useMemo(() => screenWidth - 80, []);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleItemSelect = useCallback((item) => {
    setSelectedItem(item);
  }, []);
  
  const handlePeriodChange = useCallback((period) => {
    setSelectedPeriod(period);
  }, []);

  const handleSaveGoal = () => {
    const newGoal = parseFloat(goalInput);
    if (isNaN(newGoal) || newGoal <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number for your energy limit.");
      return;
    }
    setDailyEnergyGoal(newGoal);
    setIsGoalModalVisible(false);
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Summary</Text>
          
          {/* Period Options Selector - Bubble style */}
          <View style={styles.monthSelectorContainer} pointerEvents="box-none">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthSelector}
              removeClippedSubviews={true}
              scrollEventThrottle={16}
            >
              {periodOptions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.monthBubble,
                    selectedItem === item && styles.monthBubbleActive
                  ]}
                  onPress={() => handleItemSelect(item)}
                >
                  <Text style={[
                    styles.monthText,
                    selectedItem === item && styles.monthTextActive
                  ]}>
                    {item}
                  </Text>
            </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Period Selector - Improved style */}
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[
                styles.periodButton,
                selectedPeriod === 'Week' && styles.periodButtonActive
              ]}
              onPress={() => handlePeriodChange('Week')}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === 'Week' && styles.periodButtonTextActive
              ]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.periodButton,
                selectedPeriod === 'Month' && styles.periodButtonActive
              ]}
              onPress={() => handlePeriodChange('Month')}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === 'Month' && styles.periodButtonTextActive
              ]}>
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.periodButton,
                selectedPeriod === 'Year' && styles.periodButtonActive
              ]}
              onPress={() => handlePeriodChange('Year')}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === 'Year' && styles.periodButtonTextActive
              ]}>
                Year
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Chart in Bubble */}
          <View style={styles.chartBubble}>
          <LineChart
              key={`chart-${selectedPeriod}`}
            data={chartData}
              width={chartWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
                color: (opacity = 1) => `rgba(31, 178, 138, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#1fb28a'
              }
            }}
            bezier
            style={styles.chart}
          />
          </View>
          
          {/* Total Energy - Progress Bar design */}
          <View style={styles.totalEnergyContainer}>
            <Text style={styles.totalEnergyLabel}>Daily Usage Status</Text>
            <EnergyCircle
              primaryValue={totalEnergy}
              primaryLabel="Usage"
              secondaryValue={offsetEnergy}
              secondaryLabel="Offset"
              primaryColor="#1fb28a"
              secondaryColor="#E3F2FD"
              size={180} // Just kept for prop compatibility
              variant="report"
              dailyGoal={dailyEnergyGoal}
              onGoalPress={() => setIsGoalModalVisible(true)}
            />
          </View>
        </View>
      </ScrollView>
      
      <BottomNavigation />

      {/* Daily Goal Setting Modal */}
      <Modal
        visible={isGoalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Set Daily Energy Limit</Text>
                <Text style={styles.modalSubtitle}>Enter your target max energy usage (Wh):</Text>
                <TextInput 
                    style={styles.goalInput}
                    keyboardType="numeric"
                    value={goalInput}
                    onChangeText={setGoalInput}
                    placeholder="300"
                />
                <View style={styles.modalButtons}>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setIsGoalModalVisible(false)}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.saveButton]}
                        onPress={handleSaveGoal}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20
  },
  monthSelectorContainer: {
    marginBottom: 20,
    height: 45,
    overflow: 'hidden'
  },
  monthSelector: {
    flexDirection: 'row',
    paddingVertical: 5
  },
  monthBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  monthBubbleActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1fb28a',
    borderWidth: 2
  },
  monthText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  monthTextActive: {
    color: '#1fb28a',
    fontWeight: '600'
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    height: 40,
    alignItems: 'center'
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  periodButtonActive: {
    backgroundColor: '#1fb28a',
    borderColor: '#1fb28a'
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  chartBubble: {
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 250,
    width: '100%',
    overflow: 'hidden'
  },
  chart: {
    borderRadius: 16
  },
  totalEnergyContainer: {
    alignItems: 'center',
    marginVertical: 20
  },
  totalEnergyLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20
  },
  // Removed actionButtons and related styles
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  goalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#1fb28a',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  }
});

export default EnergyReport;
