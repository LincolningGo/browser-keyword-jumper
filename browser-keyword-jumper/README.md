# 🐕 Browser Keyword Jumper

一个可爱的浏览器扩展，通过关键字快速跳转到常用网站。只需在地址栏输入简短的关键字，就能瞬间访问你的目标网站！

![Browser Keyword Jumper](./docs/images/hero-banner.png)

## ✨ 特性

- 🚀 **快速跳转** - 在地址栏输入关键字即可快速访问网站
- 🔍 **智能搜索** - 支持模糊匹配和实时搜索
- 📄 **分页浏览** - 大量关键字时自动分页显示
- 📥📤 **导入导出** - 轻松备份和同步配置
- 🎨 **友好界面** - 现代化设计，操作简单直观
- 🐕 **可爱图标** - 戴头盔的狗狗陪伴你的浏览之旅
- 🌐 **跨浏览器** - 支持 Chrome、Firefox、Edge

## 🎯 使用场景

- **开发者** - 快速访问开发环境、管理后台、代码仓库
- **设计师** - 快速打开设计工具、素材网站、灵感平台  
- **学生** - 快速访问学习平台、在线工具、参考资料
- **办公族** - 快速打开常用的办公系统、邮箱、文档

## 🚀 快速开始

### 安装扩展

1. 下载最新版本的 [release](./release) 文件夹
2. 打开浏览器扩展管理页面：
   - Chrome: `chrome://extensions/`
   - Firefox: `about:addons`
   - Edge: `edge://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"，选择 `release` 文件夹
5. 看到工具栏出现可爱的狗狗图标 🐕 就安装成功了！

### 基本使用

1. **添加关键字**
   - 点击狗狗图标打开配置面板
   - 输入关键字、网址和描述
   - 点击"添加关键字"

2. **快速跳转**
   - 在地址栏输入 `kj` 后按空格
   - 输入你配置的关键字
   - 按回车或选择建议即可跳转

3. **管理关键字**
   - 使用搜索功能快速找到关键字
   - 点击编辑按钮修改配置
   - 点击删除按钮移除不需要的关键字

## 📖 详细文档

- [📥 安装指南](./INSTALL.md) - 详细的安装步骤和故障排除
- [🔧 开发指南](./DEVELOPER.md) - 开发环境搭建和代码结构
- [📋 更新日志](./CHANGELOG.md) - 版本更新记录
- [🛍️ 商店列表](./STORE_LISTING.md) - 应用商店发布信息

## 🎨 界面预览

### 配置面板
![配置面板](./docs/images/popup-interface.png)

### 地址栏跳转
![地址栏跳转](./docs/images/omnibox-demo.png)

### 搜索和分页
![搜索分页](./docs/images/search-pagination.png)

## 🛠️ 技术栈

- **前端**: 原生 JavaScript + HTML5 + CSS3
- **架构**: Manifest V3 扩展架构
- **存储**: WebExtensions Storage API
- **兼容性**: Chrome 88+, Firefox 109+, Edge 88+

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 报告问题
- 使用 [Issues](../../issues) 报告 bug 或提出功能建议
- 请提供详细的复现步骤和环境信息

### 提交代码
1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发环境
```bash
# 克隆仓库
git clone https://github.com/your-username/browser-keyword-jumper.git
cd browser-keyword-jumper

# 安装开发依赖（如果有）
npm install

# 运行测试
npm test

# 构建发布版本
npm run build
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢所有贡献者的努力
- 图标设计灵感来源于可爱的狗狗形象
- 特别感谢开源社区的支持

## 📞 联系我们

- 📧 邮箱: [your-email@example.com](mailto:your-email@example.com)
- 🐛 问题反馈: [GitHub Issues](../../issues)
- 💬 讨论交流: [GitHub Discussions](../../discussions)

---

<div align="center">
  <p>如果这个项目对你有帮助，请给我们一个 ⭐️ Star！</p>
  <p>Made with ❤️ by the Browser Keyword Jumper Team</p>
</div>