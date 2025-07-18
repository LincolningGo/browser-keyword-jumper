#!/bin/bash

# Browser Keyword Jumper 清理脚本
# 清理构建产生的文件

echo "🧹 清理构建文件..."

# 删除构建目录
rm -rf release/
rm -rf dist/

# 删除压缩包
rm -f browser-keyword-jumper-v*.zip

# 删除临时文件
find . -name ".DS_Store" -delete
find . -name "*.tmp" -delete

echo "✅ 清理完成！"