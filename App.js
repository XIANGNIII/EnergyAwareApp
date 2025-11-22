import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { EnergyProvider } from './src/context/EnergyContext';
import 'react-native-gesture-handler';


const App = () => {
  return (
    <SafeAreaProvider>
      <EnergyProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </EnergyProvider>
    </SafeAreaProvider>
  );
};

export default App;