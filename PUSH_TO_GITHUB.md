# 推送代码到 GitHub 指南

## 步骤 1: 在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `EnergyAwareChat` (或你喜欢的名字)
   - **Description**: Energy-aware AI chat application with carbon offset tracking
   - **Visibility**: 选择 Public 或 Private
   - **不要勾选** "Initialize this repository with a README"（因为我们本地已有代码）
3. 点击 **Create repository**

## 步骤 2: 连接本地仓库到 GitHub

创建仓库后，GitHub 会显示命令。使用以下命令：

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/EnergyAwareChat.git

# 或者使用 SSH（如果你配置了 SSH key）
git remote add origin git@github.com:YOUR_USERNAME/EnergyAwareChat.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

## 从 Cursor 中执行

你也可以在 Cursor 的终端中执行这些命令：

1. 打开 Cursor 的集成终端（Terminal → New Terminal）
2. 执行上述命令
3. 如果提示输入用户名和密码，使用 GitHub Personal Access Token（不是密码）

## 使用 GitHub CLI（更简单的方法）

如果你安装了 GitHub CLI：

```bash
# 安装 GitHub CLI（如果还没有）
brew install gh

# 登录 GitHub
gh auth login

# 创建仓库并推送（会自动创建远程仓库）
gh repo create EnergyAwareChat --public --source=. --remote=origin --push
```

## 常见问题

### 1. 认证失败
如果遇到认证问题，需要使用 Personal Access Token：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成 token 后，使用 token 作为密码

### 2. 远程仓库已存在
如果远程仓库已经存在，使用：
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/EnergyAwareChat.git
git push -u origin main
```

### 3. 检查远程仓库
```bash
git remote -v
```

