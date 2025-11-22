# 在真实手机上测试应用指南

## iOS (iPhone) 测试步骤

### 1. 准备工作
- 确保 Mac 已安装 Xcode（从 App Store 下载）
- 用 USB 线连接 iPhone 到 Mac
- 在 iPhone 上：**设置 → 通用 → VPN 与设备管理 → 信任此电脑**

### 2. 配置 Xcode
```bash
# 打开 iOS 项目（注意是 .xcworkspace，不是 .xcodeproj）
open ios/EnergyAwareChat.xcworkspace
```

在 Xcode 中：
1. 在顶部设备选择器中选择你的 iPhone（而不是模拟器）
2. 选择项目 → **EnergyAwareChat** target → **Signing & Capabilities**
3. 勾选 **"Automatically manage signing"**
4. 选择你的 **Team**（如果没有，需要注册免费 Apple ID）

### 3. 运行应用
- 在 Xcode 中点击 **运行按钮**（▶️）或按 `Cmd + R`
- 或者使用命令行：
```bash
# 启动 Metro bundler（如果还没启动）
npm start

# 在另一个终端窗口运行
npx react-native run-ios --device
```

### 4. 首次运行注意事项
- 首次在真机上运行需要在 iPhone 上：**设置 → 通用 → VPN 与设备管理** → 信任开发者证书
- 应用安装后，在 iPhone 上点击应用图标即可运行

---

## Android 测试步骤

### 1. 准备工作
- 在 Android 手机上启用开发者选项：
  1. 打开 **设置 → 关于手机**
  2. 连续点击 **版本号** 7 次
  3. 返回设置，找到 **开发者选项**
- 启用 USB 调试：
  1. 进入 **开发者选项**
  2. 开启 **USB 调试**
  3. 开启 **USB 安装**（如果有）
- 用 USB 线连接手机到电脑
- 在手机上允许 USB 调试（会弹出提示）

### 2. 检查设备连接
```bash
# 检查设备是否连接
adb devices
```

如果看到设备列表中有你的手机，说明连接成功。

### 3. 运行应用
```bash
# 启动 Metro bundler（如果还没启动）
npm start

# 在另一个终端窗口运行
npx react-native run-android
```

### 4. 首次运行注意事项
- 应用会自动安装到手机上
- 如果遇到权限问题，确保手机允许安装未知来源的应用

---

## 无线调试（可选）

### iOS
1. 确保 iPhone 和 Mac 连接到同一个 Wi-Fi 网络
2. 在 Xcode 中：**Window → Devices and Simulators**
3. 选择你的 iPhone，勾选 **"Connect via network"**
4. 之后可以断开 USB 线，无线运行应用

### Android
1. 确保手机和电脑连接到同一个 Wi-Fi 网络
2. 在手机上找到 IP 地址：**设置 → 关于手机 → 状态信息 → IP 地址**
3. 使用 adb 连接：
```bash
adb tcpip 5555
adb connect <手机IP地址>:5555
```
4. 之后可以断开 USB 线，使用 `npx react-native run-android` 无线运行

---

## 常见问题

### iOS
- **"No devices found"**: 确保 iPhone 已解锁并信任此电脑
- **签名错误**: 检查 Xcode 中的 Signing & Capabilities 设置
- **应用无法安装**: 检查 iPhone 的信任设置

### Android
- **"No devices found"**: 
  - 运行 `adb devices` 检查连接
  - 确保 USB 调试已启用
  - 尝试更换 USB 线或 USB 端口
- **"INSTALL_FAILED"**: 
  - 确保手机有足够存储空间
  - 检查是否已安装旧版本，先卸载再安装

---

## 调试技巧

### 查看日志
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

### 重新加载应用
- **iOS**: 在手机上摇一摇，选择 "Reload"
- **Android**: 在手机上按 `R + R` 或摇一摇，选择 "Reload"
- 或者在 Metro bundler 终端按 `R` 键

### 清除缓存重新安装
```bash
# iOS
cd ios && pod install && cd ..
npx react-native run-ios --device --reset-cache

# Android
npx react-native run-android --reset-cache
```

