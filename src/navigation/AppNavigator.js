import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { TransitionSpecs, StackCardStyleInterpolator } from '@react-navigation/stack';
import ModelSelection from '../components/ModelSelection';
import ChatScreen from '../components/ChatScreen';
import ChatMainScreen from '../components/ChatMainScreen';
import ChatHistory from '../components/ChatHistory';
import EnergyReport from '../components/EnergyReport';
import CarbonOffset from '../components/CarbonOffset';
import ChatDetail from '../components/ChatDetail.js'; 

// 启用screens
enableScreens();

// 自定义无动画过渡
const customTransition = {
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },
  cardStyleInterpolator: () => {
    return {
      cardStyle: {
        opacity: 1, // 直接设置不透明度为1，没有淡入淡出
      },
      overlayStyle: {
        opacity: 0, // 确保没有覆盖层动画
      },
    };
  },
  headerStyleInterpolator: () => {
    return {
      // 保持标题样式固定
      leftButtonStyle: { opacity: 1 },
      rightButtonStyle: { opacity: 1 },
      titleStyle: { opacity: 1 },
      backgroundStyle: { opacity: 1 },
    };
  },
};

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        gestureEnabled: false,
        cardOverlayEnabled: false,
        ...customTransition,
        headerLeft: () => null, 
        
        // 配置标题栏样式
        headerStyle: {
          backgroundColor: '#fff',
          height: 56,
          elevation: 1,
          shadowOpacity: 0.1,
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        cardStyle: { 
          backgroundColor: '#fff',
          // 禁止卡片阴影
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          elevation: 0,
        }
      }}
      // 彻底禁用动画
      detachInactiveScreens={false}
    >
      <Stack.Screen name="ModelSelection" component={ChatMainScreen} options={{ title: 'ChatGPT - 01' }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'ChatGPT - 01' }} />
      <Stack.Screen name="ChatHistory" component={ChatHistory} options={{ title: 'Chat History' }} />
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatDetail} 
        options={{ title: 'Chat Detail' }}
      />
      <Stack.Screen name="EnergyReport" component={EnergyReport} options={{ title: 'Energy Usage Report' }} />
      <Stack.Screen name="CarbonOffset" component={CarbonOffset} options={{ title: 'Your Offset Record' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;