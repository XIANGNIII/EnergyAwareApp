import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ModelSelection from './ModelSelection';
import ChatScreen from './ChatScreen';
import ChatHistory from './ChatHistory';
import PageIndicator from './PageIndicator';
import BottomNavigation from './BottomNavigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ChatMainScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);

  const handleMomentumScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentPage(pageIndex);
  };

  // 监听导航事件，允许从外部切换页面
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      // 如果导航到 ChatScreen，切换到第二页
      if (route.name === 'ChatScreen' || route.params?.goToChat) {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: SCREEN_WIDTH, animated: true });
          setCurrentPage(1);
        }
      }
    });

    return unsubscribe;
  }, [navigation, route]);

  // 处理从 ModelSelection 跳转到 ChatScreen
  const handleStartChatting = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: SCREEN_WIDTH, animated: true });
      setCurrentPage(1);
    }
    // 同时更新导航状态
    navigation.setParams({ goToChat: true });
  }, [navigation]);

  // 处理点击指示器切换页面
  const handleIndicatorPress = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
      setCurrentPage(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        <View style={styles.page}>
          <ModelSelection 
            navigation={navigation} 
            onStartChatting={handleStartChatting}
          />
        </View>
        <View style={styles.page}>
          <ChatScreen />
        </View>
      </ScrollView>
      
      {/* 只有在 Model Selection 页面 (currentPage === 0) 才显示圆点指示器 */}
      {currentPage === 0 && (
        <TouchableOpacity 
          style={styles.indicatorContainer}
          activeOpacity={1}
          onPress={() => handleIndicatorPress(currentPage)}
        >
          <PageIndicator currentIndex={currentPage} totalPages={2} />
        </TouchableOpacity>
      )}
      
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  indicatorContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  placeholderPage: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatMainScreen;