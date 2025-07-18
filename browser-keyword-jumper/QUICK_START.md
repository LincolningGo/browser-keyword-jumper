# 🚀 快速开始

## 📦 构建和安装

### 1. 构建扩展
```bash
# 克隆或下载项目
git clone https://github.com/your-username/browser-keyword-jumper.git
cd browser-keyword-jumper

# 构建发布版本
./build.sh
```

### 2. 安装到浏览器
```bash
# 构建完成后，会生成以下文件：
# - release/           (完整版本，包含文档)
# - dist/              (精简版本，仅扩展文件)  
# - browser-keyword-jumper-v1.1.0.zip (压缩包)
```

**Chrome 安装步骤：**
1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `release/` 或 `dist/` 文件夹
5. 看到工具栏出现狗狗图标 🐕 即安装成功！

## 🎯 基本使用

### 添加关键字
1. 点击工具栏的狗狗图标
2. 在弹出的配置面板中输入：
   - **关键字**: `admin` 
   - **网址**: `https://admin.example.com`
   - **描述**: `管理后台`
3. 点击"添加关键字"

### 快速跳转
1. 在地址栏输入 `kj` 后按空格
2. 输入关键字 `admin`
3. 按回车或选择建议即可跳转

## 🛠️ 开发命令

```bash
# 构建发布版本
./build.sh

# 清理构建文件
./clean.sh

# 或使用 npm 命令
npm run build    # 构建
npm run clean    # 清理
npm run release  # 构建并提示
```

## 📁 项目结构

```
browser-keyword-jumper/
├── src/                    # 源代码
│   ├── manifest.json      # 扩展配置
│   ├── background.js      # 后台脚本
│   ├── popup.*           # 配置界面
│   ├── keyword-matcher.js # 匹配引擎
│   ├── icons/            # 图标文件
│   └── _locales/         # 国际化文件
├── release/               # 构建输出（完整版）
├── dist/                  # 构建输出（精简版）
├── examples/              # 示例配置文件
├── build.sh              # 构建脚本
├── clean.sh              # 清理脚本
└── README.md             # 项目说明
```

## ✨ 主要功能

- 🚀 **快速跳转** - 地址栏输入关键字即可跳转
- 🔍 **智能搜索** - 支持模糊匹配和实时搜索  
- 📄 **分页浏览** - 大量关键字时自动分页
- 📥📤 **导入导出** - 配置备份和同步
- 🎨 **可爱图标** - 戴头盔的狗狗陪伴你
- 🌐 **多语言** - 支持中英文界面

现在就开始享受快速的关键字跳转吧！🎉