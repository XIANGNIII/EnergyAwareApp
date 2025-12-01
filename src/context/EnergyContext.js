import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const EnergyContext = createContext();

export const EnergyProvider = ({ children }) => {
  // 初始化所有状态变量
  const [selectedModel, setSelectedModel] = useState('GPT-4o Mini');
  const [currentPurpose, setCurrentPurpose] = useState('Daily Questions'); // 当前对话类型
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [offsetEnergy, setOffsetEnergy] = useState(0);
  const [dailyEnergyGoal, setDailyEnergyGoal] = useState(300); // 默认每日目标
  const [energyLog, setEnergyLog] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  
  // 从存储加载数据 - 只在组件挂载时执行一次
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedEnergyLog, storedChatHistory, storedOffsetEnergy, storedDailyGoal] = await Promise.all([
          AsyncStorage.getItem('energyLog'),
          AsyncStorage.getItem('chatHistory'),
          AsyncStorage.getItem('offsetEnergy'),
          AsyncStorage.getItem('dailyEnergyGoal')
        ]);
        
        if (storedOffsetEnergy) setOffsetEnergy(parseFloat(storedOffsetEnergy));
        if (storedDailyGoal) setDailyEnergyGoal(parseFloat(storedDailyGoal));
        if (storedEnergyLog) setEnergyLog(JSON.parse(storedEnergyLog));
        if (storedChatHistory) {
          // 确保日期字段是字符串格式
          const history = JSON.parse(storedChatHistory);
          const serializedHistory = history.map(chat => ({
            ...chat,
            lastTimestamp: chat.lastTimestamp ? new Date(chat.lastTimestamp).toISOString() : null,
            messages: chat.messages ? chat.messages.map(msg => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : null
            })) : []
          }));
          setChatHistory(serializedHistory);
          
          // 从 chatHistory 计算总耗能
          const calculatedTotalEnergy = serializedHistory.reduce((sum, chat) => {
            return sum + (chat.totalEnergy || 0);
          }, 0);
          setTotalEnergy(calculatedTotalEnergy);
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };
    
    loadData();
  }, []); // 空依赖数组，只执行一次
  
  // 保存能源数据 - 使用 useCallback 避免重复创建
  const saveEnergyData = useCallback(async () => {
    try {
      // totalEnergy 现在从 chatHistory 计算，不需要单独保存
      await AsyncStorage.setItem('offsetEnergy', offsetEnergy.toString());
      await AsyncStorage.setItem('dailyEnergyGoal', dailyEnergyGoal.toString());
    } catch (error) {
      console.error('Error saving energy data:', error);
    }
  }, [offsetEnergy, dailyEnergyGoal]);
  
  // 从 chatHistory 计算总耗能
  useEffect(() => {
    const calculatedTotalEnergy = chatHistory.reduce((sum, chat) => {
      return sum + (chat.totalEnergy || 0);
    }, 0);
    setTotalEnergy(calculatedTotalEnergy);
  }, [chatHistory]);
  
  // 保存日志数据
  const saveLogData = useCallback(async () => {
    try {
      await AsyncStorage.setItem('energyLog', JSON.stringify(energyLog));
    } catch (error) {
      console.error('Error saving log data:', error);
    }
  }, [energyLog]);
  
  // 保存聊天历史
  const saveChatHistory = useCallback(async () => {
    try {
      // 序列化聊天历史，确保所有日期都是字符串
      const serializedHistory = chatHistory.map(chat => ({
        ...chat,
        lastTimestamp: chat.lastTimestamp ? 
          (typeof chat.lastTimestamp === 'string' ? chat.lastTimestamp : new Date(chat.lastTimestamp).toISOString()) 
          : null,
        messages: chat.messages ? chat.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? 
            (typeof msg.timestamp === 'string' ? msg.timestamp : new Date(msg.timestamp).toISOString())
            : null
        })) : []
      }));
      await AsyncStorage.setItem('chatHistory', JSON.stringify(serializedHistory));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [chatHistory]);
  
  // 分开保存不同类型的数据，避免相互触发
  useEffect(() => {
    saveEnergyData();
  }, [offsetEnergy, dailyEnergyGoal, saveEnergyData]);
  
  useEffect(() => {
    saveLogData();
  }, [energyLog, saveLogData]);
  
  useEffect(() => {
    saveChatHistory();
  }, [chatHistory, saveChatHistory]);
  
  // 计算token数量的函数
  const estimateTokens = (text) => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  };
  
  // 开始新的聊天会话 - 使用 useCallback
  const startNewChat = useCallback(() => {
    // 修正：无论如何都应该创建一个新ID，并设置它
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    return newChatId;
  }, []); // 依赖项数组为空，确保它总是执行
  
  // 添加聊天记录
  const addChatRecord = useCallback((userInput, aiResponse, model, purpose = null) => {
    if (!userInput || !aiResponse || !model) {
      console.warn('Invalid chat record data', { userInput, aiResponse, model });
      return;
    }
    
    const timestamp = new Date().toISOString(); // 使用字符串格式
    
    // 使用传入的 purpose，如果没有则使用当前保存的 purpose
    const conversationPurpose = purpose || currentPurpose;
    
    // 判断是长对话还是短对话
    // Academic Writing 和 Programming 是长对话，Daily Questions 是短对话
    const isLongConversation = conversationPurpose === 'Academic Writing' || conversationPurpose === 'Programming';
    
    // 根据参考数据计算耗能（Wh）
    // 长对话：约 7000 words input + 1000 words output = 约 32000 tokens
    // 短对话：约 1000 tokens
    const getEnergyConsumption = (modelName, isLong) => {
      if (isLong) {
        // 长对话耗能（Wh）
        switch (modelName) {
          case 'GPT-4o':
            return 1.788;
          case 'GPT-4o Mini':
            return 2.0; // 因为部署在 A100，比 GPT-4o 稍高
          case 'GPT-4.5 Turbo':
            return 30.495;
          case 'GPT-5':
            return 30.495; // 假设类似 GPT-4.5
          default:
            return 1.788; // 默认使用 GPT-4o 的值
        }
      } else {
        // 短对话耗能（Wh）
        switch (modelName) {
          case 'GPT-4o':
            return 0.42;
          case 'GPT-4o Mini':
            return 0.5; // 因为部署在 A100，比 GPT-4o 稍高
          case 'GPT-4.5 Turbo':
            // 短对话假设为长对话的 1/4
            return 30.495 / 4;
          case 'GPT-5':
            return 30.495 / 4;
          default:
            return 0.42;
        }
      }
    };
    
    const energyConsumption = getEnergyConsumption(model, isLongConversation);
    
    // 计算 token 数量（用于记录，但不用于计算耗能）
    const userTokens = estimateTokens(userInput);
    const aiTokens = estimateTokens(aiResponse);
    const totalTokens = userTokens + aiTokens;
    
    const chatId = currentChatId || startNewChat();
    
    // 使用函数式更新来确保获取最新的 chatHistory
    setChatHistory(prevHistory => {
      const existingChatIndex = prevHistory.findIndex(chat => chat.id === chatId);
      let actualEnergyConsumption = energyConsumption;
      
      if (existingChatIndex >= 0) {
        const updatedHistory = [...prevHistory];
        const existingChat = updatedHistory[existingChatIndex];
        
        // 对于现有对话，继续使用原来的 purpose 和 model
        const chatPurpose = existingChat.purpose || conversationPurpose;
        const chatModel = model || existingChat.model;
        const chatIsLong = chatPurpose === 'Academic Writing' || chatPurpose === 'Programming';
        actualEnergyConsumption = getEnergyConsumption(chatModel, chatIsLong);
        
        const updatedMessages = [
          ...(existingChat.messages || []),
          { 
            userInput, 
            aiResponse, 
            timestamp, // 已经是字符串格式
            userTokens,
            aiTokens,
            totalTokens,
            energy: actualEnergyConsumption
          }
        ];
        
        updatedHistory[existingChatIndex] = {
          ...existingChat,
          model: chatModel,
          purpose: chatPurpose,
          lastUserInput: userInput,
          lastAiResponse: aiResponse,
          lastTimestamp: timestamp, // 已经是字符串格式
          messages: updatedMessages,
          totalUserTokens: (existingChat.totalUserTokens || 0) + userTokens,
          totalAiTokens: (existingChat.totalAiTokens || 0) + aiTokens,
          totalTokens: (existingChat.totalTokens || 0) + totalTokens,
          totalEnergy: (existingChat.totalEnergy || 0) + actualEnergyConsumption
        };
        
        // 在回调中更新 energyLog
        setEnergyLog(prevLog => [...prevLog, { timestamp, energy: actualEnergyConsumption }]);
        
        return updatedHistory;
      } else {
        const newChat = {
          id: chatId,
          model,
          purpose: conversationPurpose,
          lastUserInput: userInput,
          lastAiResponse: aiResponse,
          lastTimestamp: timestamp, // 已经是字符串格式
          messages: [{ 
            userInput, 
            aiResponse, 
            timestamp, // 已经是字符串格式
            userTokens,
            aiTokens,
            totalTokens,
            energy: energyConsumption
          }],
          totalUserTokens: userTokens,
          totalAiTokens: aiTokens,
          totalTokens: totalTokens,
          totalEnergy: energyConsumption
        };
        
        // 在回调中更新 energyLog
        setEnergyLog(prevLog => [...prevLog, { timestamp, energy: energyConsumption }]);
        
        return [newChat, ...prevHistory];
      }
    });
    
    // totalEnergy 现在从 chatHistory 自动计算，不需要手动更新
  }, [currentChatId, startNewChat, currentPurpose]);
  
  // 添加碳补偿行动
  const addOffsetAction = useCallback((action, amount) => {
    setOffsetEnergy(prev => prev + amount);
  }, []);
  
  const value = {
    selectedModel,
    setSelectedModel,
    currentPurpose,
    setCurrentPurpose,
    totalEnergy,
    offsetEnergy,
    dailyEnergyGoal,
    setDailyEnergyGoal,
    energyLog,
    chatHistory,
    addChatRecord,
    estimateTokens,
    startNewChat,
    currentChatId,
    setCurrentChatId,
    addOffsetAction
  };
  
  return (
    <EnergyContext.Provider value={value}>
      {children}
    </EnergyContext.Provider>
  );
};
