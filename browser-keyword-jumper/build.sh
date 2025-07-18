#!/bin/bash

# Browser Keyword Jumper 构建脚本
# 用于生成可直接安装到浏览器的 release 版本

set -e  # 遇到错误时退出

echo "🐕 Browser Keyword Jumper 构建开始..."

# 项目信息
PROJECT_NAME="browser-keyword-jumper"
VERSION=$(grep '"version"' src/manifest.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
BUILD_DIR="release"
DIST_DIR="dist"

echo "📦 项目: $PROJECT_NAME"
echo "🏷️  版本: $VERSION"

# 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf "$BUILD_DIR"
rm -rf "$DIST_DIR"
rm -f "${PROJECT_NAME}-v${VERSION}.zip"

# 创建构建目录
echo "📁 创建构建目录..."
mkdir -p "$BUILD_DIR"
mkdir -p "$DIST_DIR"

# 复制源文件到构建目录
echo "📋 复制源文件..."
cp src/manifest.json "$BUILD_DIR/"
cp src/background.js "$BUILD_DIR/"
cp src/popup.html "$BUILD_DIR/"
cp src/popup.css "$BUILD_DIR/"
cp src/popup.js "$BUILD_DIR/"
cp src/keyword-matcher.js "$BUILD_DIR/"

# 复制图标文件
echo "🎨 复制图标文件..."
cp -r src/icons "$BUILD_DIR/"

# 复制国际化文件
echo "🌐 复制国际化文件..."
cp -r src/_locales "$BUILD_DIR/"

# 复制文档文件到构建目录
echo "📚 复制文档文件..."
cp README.md "$BUILD_DIR/"
cp LICENSE "$BUILD_DIR/"

# 创建发布说明
echo "📝 生成发布说明..."
cat > "$BUILD_DIR/RELEASE_NOTES.md" << EOF
# Browser Keyword Jumper v${VERSION}

## 🐕 关于此版本

这是 Browser Keyword Jumper 的发布版本，包含所有必要的文件，可以直接安装到浏览器中。

## 📦 安装方法

1. 下载并解压此文件夹
2. 打开浏览器扩展管理页面：
   - Chrome: \`chrome://extensions/\`
   - Firefox: \`about:addons\`
   - Edge: \`edge://extensions/\`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"，选择此文件夹
5. 看到工具栏出现狗狗图标即安装成功！

## ✨ 主要功能

- 🚀 快速关键字跳转
- 🔍 智能搜索和分页
- 📥📤 配置导入导出
- 🎨 可爱的狗狗图标
- 🌐 多语言支持

## 🎯 使用方法

1. 点击狗狗图标打开配置面板
2. 添加关键字和对应的网址
3. 在地址栏输入 \`kj 关键字\` 快速跳转

---
构建时间: $(date)
EOF

# 创建分发版本（去除开发文件）
echo "📦 创建分发版本..."
cp -r "$BUILD_DIR"/* "$DIST_DIR/"
rm -f "$DIST_DIR/README.md"
rm -f "$DIST_DIR/LICENSE"
rm -f "$DIST_DIR/RELEASE_NOTES.md"

# 验证必要文件
echo "✅ 验证构建文件..."
required_files=(
    "manifest.json"
    "background.js"
    "popup.html"
    "popup.css"
    "popup.js"
    "keyword-matcher.js"
    "icons/icon16.png"
    "icons/icon48.png"
    "icons/icon128.png"
    "_locales/en/messages.json"
    "_locales/zh_CN/messages.json"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [[ ! -f "$BUILD_DIR/$file" ]]; then
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo "❌ 缺少必要文件:"
    printf '   - %s\n' "${missing_files[@]}"
    exit 1
fi

# 创建压缩包
echo "🗜️  创建压缩包..."
cd "$BUILD_DIR"
zip -r "../${PROJECT_NAME}-v${VERSION}.zip" . -x "*.DS_Store" "*.git*"
cd ..

# 显示构建结果
echo ""
echo "🎉 构建完成！"
echo ""
echo "📁 构建文件:"
echo "   - $BUILD_DIR/           (完整版本，包含文档)"
echo "   - $DIST_DIR/            (精简版本，仅扩展文件)"
echo "   - ${PROJECT_NAME}-v${VERSION}.zip  (压缩包)"
echo ""
echo "📊 文件统计:"
echo "   - 构建目录文件数: $(find "$BUILD_DIR" -type f | wc -l)"
echo "   - 分发目录文件数: $(find "$DIST_DIR" -type f | wc -l)"
echo "   - 压缩包大小: $(du -h "${PROJECT_NAME}-v${VERSION}.zip" | cut -f1)"
echo ""
echo "🔧 安装方法:"
echo "   1. 打开浏览器扩展管理页面"
echo "   2. 启用开发者模式"
echo "   3. 加载 '$BUILD_DIR' 或 '$DIST_DIR' 文件夹"
echo ""
echo "✨ 享受使用 Browser Keyword Jumper！"