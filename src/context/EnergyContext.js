// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const EnergyContext = createContext();

// export const EnergyProvider = ({ children }) => {
//   // 初始化所有状态变量
//   const [selectedModel, setSelectedModel] = useState('GPT-4o Mini');
//   const [totalEnergy, setTotalEnergy] = useState(0);
//   const [energyLog, setEnergyLog] = useState([]);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentChatId, setCurrentChatId] = useState(null);
  
//   // 从存储加载数据
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const storedTotalEnergy = await AsyncStorage.getItem('totalEnergy');
//         const storedEnergyLog = await AsyncStorage.getItem('energyLog');
//         const storedChatHistory = await AsyncStorage.getItem('chatHistory');
        
//         if (storedTotalEnergy) setTotalEnergy(parseFloat(storedTotalEnergy));
//         if (storedEnergyLog) setEnergyLog(JSON.parse(storedEnergyLog));
//         if (storedChatHistory) setChatHistory(JSON.parse(storedChatHistory));
//       } catch (error) {
//         console.error('Error loading data from AsyncStorage:', error);
//       }
//     };
    
//     loadData();
//   }, []);
  
//   // 保存数据到存储
//   useEffect(() => {
//     const saveData = async () => {
//       try {
//         await AsyncStorage.setItem('totalEnergy', totalEnergy.toString());
//         await AsyncStorage.setItem('energyLog', JSON.stringify(energyLog));
//         await AsyncStorage.setItem('chatHistory', JSON.stringify(chatHistory));
//       } catch (error) {
//         console.error('Error saving data to AsyncStorage:', error);
//       }
//     };
    
//     saveData();
//   }, [totalEnergy, energyLog, chatHistory]);
  
//   // 计算token数量的函数 (简单估算)
//   const estimateTokens = (text) => {
//     if (!text) return 0;
//     return Math.ceil(text.length / 4);
//   };
  
//   // // 开始新的聊天会话
//   // const startNewChat = () => {
//   //   // 只有当currentChatId为null或undefined时才设置新ID
//   //   if (!currentChatId) {
//   //     const newChatId = Date.now().toString();
//   //     setCurrentChatId(newChatId);
//   //     return newChatId;
//   //   }
//   //   return currentChatId; // 如果已经有ID，则返回现有ID
//   // };
//   const startNewChat = useCallback(() => {
//     if (!currentChatId) {
//       const newChatId = Date.now().toString();
//       setCurrentChatId(newChatId);
//       return newChatId;
//     }
//     return currentChatId;
//   }, [currentChatId]);
  
//   // 添加聊天记录 - 修改为支持对话连续性
//   const addChatRecord = (userInput, aiResponse, model) => {
//     // 保护性检查
//     if (!userInput || !aiResponse || !model) {
//       console.warn('Invalid chat record data', { userInput, aiResponse, model });
//       return;
//     }
    
//     const timestamp = new Date();
    
//     // 估计token数
//     const userTokens = estimateTokens(userInput);
//     const aiTokens = estimateTokens(aiResponse);
//     const totalTokens = userTokens + aiTokens;
    
//     // 基于不同模型估算能源消耗 (Wh)
//     const modelEnergyRate = {
//       'GPT-5': 0.03,
//       'GPT-4.5 Turbo': 0.025, 
//       'GPT-4o': 0.02,
//       'GPT-4o Mini': 0.01
//     };
    
//     // 计算能源消耗
//     const rate = modelEnergyRate[model] || 0.01;
//     const energyConsumption = rate * totalTokens / 1000; // 单位：Wh
    
//     // 如果没有当前聊天ID，创建一个新的
//     const chatId = currentChatId || startNewChat();
    
//     setChatHistory(prevHistory => {
//       // 检查是否已存在此ID的聊天记录
//       const existingChatIndex = prevHistory.findIndex(chat => chat.id === chatId);
      
//       if (existingChatIndex >= 0) {
//         // 更新现有聊天记录
//         const updatedHistory = [...prevHistory];
//         const existingChat = updatedHistory[existingChatIndex];
        
//         // 添加新的消息对
//         const updatedMessages = [
//           ...existingChat.messages || [],
//           { 
//             userInput, 
//             aiResponse, 
//             timestamp,
//             userTokens,
//             aiTokens,
//             totalTokens,
//             energy: energyConsumption
//           }
//         ];
        
//         // 更新总token和能源消耗
//         const updatedTotalUserTokens = (existingChat.totalUserTokens || 0) + userTokens;
//         const updatedTotalAiTokens = (existingChat.totalAiTokens || 0) + aiTokens;
//         const updatedTotalTokens = updatedTotalUserTokens + updatedTotalAiTokens;
//         const updatedTotalEnergy = (existingChat.totalEnergy || 0) + energyConsumption;
        
//         // 创建更新后的聊天记录
//         updatedHistory[existingChatIndex] = {
//           ...existingChat,
//           lastUserInput: userInput,
//           lastAiResponse: aiResponse,
//           lastTimestamp: timestamp,
//           messages: updatedMessages,
//           totalUserTokens: updatedTotalUserTokens,
//           totalAiTokens: updatedTotalAiTokens,
//           totalTokens: updatedTotalTokens,
//           totalEnergy: updatedTotalEnergy
//         };
        
//         return updatedHistory;
//       } else {
//         // 创建新的聊天记录
//         const newChat = {
//           id: chatId,
//           model,
//           lastUserInput: userInput,
//           lastAiResponse: aiResponse,
//           lastTimestamp: timestamp,
//           messages: [{ 
//             userInput, 
//             aiResponse, 
//             timestamp,
//             userTokens,
//             aiTokens,
//             totalTokens,
//             energy: energyConsumption
//           }],
//           totalUserTokens: userTokens,
//           totalAiTokens: aiTokens,
//           totalTokens: totalTokens,
//           totalEnergy: energyConsumption
//         };
        
//         return [newChat, ...prevHistory];
//       }
//     });
    
//     // 更新能源日志和总消耗
//     setEnergyLog(prevLog => [...prevLog, { timestamp, energy: energyConsumption }]);
//     setTotalEnergy(prevEnergy => prevEnergy + energyConsumption);
//   };
  
//   return (
//     <EnergyContext.Provider
//       value={{
//         selectedModel,
//         setSelectedModel,
//         totalEnergy,
//         energyLog,
//         chatHistory,
//         addChatRecord,
//         estimateTokens,
//         startNewChat,
//         currentChatId,
//         setCurrentChatId
//       }}
//     >
//       {children}
//     </EnergyContext.Provider>
//   );
// };

import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const EnergyContext = createContext();

export const EnergyProvider = ({ children }) => {
  // 初始化所有状态变量
  const [selectedModel, setSelectedModel] = useState('GPT-4o Mini');
  const [currentPurpose, setCurrentPurpose] = useState('Daily Questions'); // 当前对话类型
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [offsetEnergy, setOffsetEnergy] = useState(0);
  const [energyLog, setEnergyLog] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  
  // 从存储加载数据 - 只在组件挂载时执行一次
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedEnergyLog, storedChatHistory, storedOffsetEnergy] = await Promise.all([
          AsyncStorage.getItem('energyLog'),
          AsyncStorage.getItem('chatHistory'),
          AsyncStorage.getItem('offsetEnergy')
        ]);
        
        if (storedOffsetEnergy) setOffsetEnergy(parseFloat(storedOffsetEnergy));
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
    } catch (error) {
      console.error('Error saving energy data:', error);
    }
  }, [offsetEnergy]);
  
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
  }, [offsetEnergy, saveEnergyData]);
  
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
  // const startNewChat = useCallback(() => {
  //   if (!currentChatId) {
  //     const newChatId = Date.now().toString();
  //     setCurrentChatId(newChatId);
  //     return newChatId;
  //   }
  //   return currentChatId;
  // }, [currentChatId]);
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