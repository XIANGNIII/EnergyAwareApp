import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ModelSelectionIcon from './icons/ModelSelectionIcon';
import HistoryIcon from './icons/HistoryIcon';
import EnergyReportIcon from './icons/EnergyReportIcon';
import CarbonOffsetIcon from './icons/CarbonOffsetIcon';

const BottomNavigation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Define navigation items
  const navItems = [
    { 
      name: 'ModelSelection', 
      label: 'Chat'
    },
    { 
      name: 'ChatHistory', 
      label: 'History'
    },
    { 
      name: 'EnergyReport', 
      label: 'Report'
    },
    { 
      name: 'CarbonOffset', 
      label: 'Offset'
    },
  ];
  
  // Check if current route is active
  const isActive = (routeName) => {
    const currentRoute = route.name;
    
    // ChatScreen should activate ModelSelection button
    if (routeName === 'ModelSelection') {
      return currentRoute === 'ModelSelection' || 
             currentRoute === 'ChatScreen';
    }
    
    // ChatDetail should activate ChatHistory button
    if (routeName === 'ChatHistory') {
      return currentRoute === 'ChatHistory' || 
             currentRoute === 'ChatDetail';
    }
    
    return currentRoute === routeName;
  };
  
  const renderIcon = (item, active) => {
    const iconProps = {
      size: 38,
      color: active ? '#1fb28a' : '#666',
      active: active
    };
    
    switch (item.name) {
      case 'ModelSelection':
        return <ModelSelectionIcon {...iconProps} />;
      case 'ChatHistory':
        return <HistoryIcon {...iconProps} />;
      case 'EnergyReport':
        return <EnergyReportIcon {...iconProps} />;
      case 'CarbonOffset':
        return <CarbonOffsetIcon {...iconProps} />;
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.footer}>
      {navItems.map((item) => {
        const active = isActive(item.name);
        return (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.footerButton,
              active && styles.footerButtonActive
            ]}
            onPress={() => navigation.navigate(item.name)}
          >
            {renderIcon(item, active)}
            <Text style={[
              styles.footerLabel,
              active && styles.footerLabelActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 8
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1
  },
  footerButtonActive: {
    // Active state can add background color
  },
  footerLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontWeight: '400'
  },
  footerLabelActive: {
    color: '#1fb28a',
    fontWeight: '600'
  }
});

export default BottomNavigation;

