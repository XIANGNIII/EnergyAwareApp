#!/bin/bash

# 推送代码到 GitHub 脚本
# 使用方法: ./push-to-github.sh YOUR_GITHUB_USERNAME YOUR_REPO_NAME

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "使用方法: ./push-to-github.sh YOUR_GITHUB_USERNAME YOUR_REPO_NAME"
    echo "例如: ./push-to-github.sh ricedumpling EnergyAwareChat"
    exit 1
fi

USERNAME=$1
REPO_NAME=$2

echo "正在添加远程仓库..."
git remote add origin https://github.com/${USERNAME}/${REPO_NAME}.git 2>/dev/null || git remote set-url origin https://github.com/${USERNAME}/${REPO_NAME}.git

echo "正在推送代码到 GitHub..."
git branch -M main
git push -u origin main

echo "完成！"
echo "查看仓库: https://github.com/${USERNAME}/${REPO_NAME}"

