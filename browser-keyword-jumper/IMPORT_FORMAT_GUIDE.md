# 导入文件格式指南

## 📋 文件格式要求

### 基本要求
- **文件格式**：JSON (.json)
- **编码**：UTF-8
- **结构**：必须包含 `keywords` 数组

## 📄 完整格式示例

```json
{
  "keywords": [
    {
      "id": "1705123456789abc",
      "keyword": "admin",
      "url": "https://admin.example.com",
      "description": "管理后台",
      "createdAt": 1705123456789,
      "updatedAt": 1705123456789
    },
    {
      "id": "1705123456790def",
      "keyword": "test",
      "url": "https://test.example.com",
      "description": "测试环境",
      "createdAt": 1705123456790,
      "updatedAt": 1705123456790
    }
  ],
  "settings": {
    "enableSuggestions": true,
    "showPreview": true,
    "version": "1.0.0"
  },
  "exportedAt": 1705123456794,
  "exportVersion": "1.0.0"
}
```

## 🔧 字段说明

### keywords 数组（必需）
每个关键字对象包含以下字段：

| 字段 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `id` | string | 可选* | 唯一标识符 | "1705123456789abc" |
| `keyword` | string | **必需** | 关键字（只能包含字母、数字、下划线、连字符） | "admin" |
| `url` | string | **必需** | 目标网址（必须是有效URL） | "https://admin.example.com" |
| `description` | string | 可选 | 描述信息 | "管理后台" |
| `createdAt` | number | 可选* | 创建时间戳 | 1705123456789 |
| `updatedAt` | number | 可选* | 更新时间戳 | 1705123456789 |

*注：如果不提供，系统会自动生成

### settings 对象（可选）
| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableSuggestions` | boolean | true | 是否启用建议功能 |
| `showPreview` | boolean | true | 是否显示预览 |
| `version` | string | "1.0.0" | 配置版本 |

### 其他字段（可选）
| 字段 | 类型 | 说明 |
|------|------|------|
| `exportedAt` | number | 导出时间戳 |
| `exportVersion` | string | 导出版本 |

## 📝 简化格式示例

如果您只想导入关键字，可以使用简化格式：

```json
{
  "keywords": [
    {
      "keyword": "github",
      "url": "https://github.com",
      "description": "GitHub"
    },
    {
      "keyword": "google",
      "url": "https://www.google.com"
    }
  ]
}
```

## 🎯 创建导入文件的方法

### 方法1：从现有配置导出
1. 在插件中添加一些关键字
2. 点击"导出"按钮
3. 下载的JSON文件就是标准格式

### 方法2：手动创建
1. 创建新的文本文件
2. 保存为 `.json` 扩展名
3. 按照上述格式编写内容

### 方法3：从其他工具转换
如果您有其他格式的数据，可以转换为JSON格式：

**从CSV转换示例：**
```csv
keyword,url,description
admin,https://admin.example.com,管理后台
test,https://test.example.com,测试环境
```

转换为：
```json
{
  "keywords": [
    {
      "keyword": "admin",
      "url": "https://admin.example.com",
      "description": "管理后台"
    },
    {
      "keyword": "test",
      "url": "https://test.example.com",
      "description": "测试环境"
    }
  ]
}
```

## ⚠️ 常见错误

### 1. JSON格式错误
```json
// ❌ 错误：缺少引号
{
  keywords: [
    {
      keyword: admin,
      url: https://example.com
    }
  ]
}

// ✅ 正确：所有字符串都要加引号
{
  "keywords": [
    {
      "keyword": "admin",
      "url": "https://example.com"
    }
  ]
}
```

### 2. 缺少必需字段
```json
// ❌ 错误：缺少keyword或url
{
  "keywords": [
    {
      "description": "管理后台"
    }
  ]
}

// ✅ 正确：包含必需字段
{
  "keywords": [
    {
      "keyword": "admin",
      "url": "https://admin.example.com",
      "description": "管理后台"
    }
  ]
}
```

### 3. 无效的URL格式
```json
// ❌ 错误：无效URL
{
  "keywords": [
    {
      "keyword": "admin",
      "url": "not-a-valid-url"
    }
  ]
}

// ✅ 正确：有效URL
{
  "keywords": [
    {
      "keyword": "admin",
      "url": "https://admin.example.com"
    }
  ]
}
```

### 4. 无效的关键字格式
```json
// ❌ 错误：包含空格和特殊字符
{
  "keywords": [
    {
      "keyword": "admin panel!",
      "url": "https://admin.example.com"
    }
  ]
}

// ✅ 正确：只包含字母、数字、下划线、连字符
{
  "keywords": [
    {
      "keyword": "admin-panel",
      "url": "https://admin.example.com"
    }
  ]
}
```

## 🧪 验证工具

### 在线JSON验证器
- [JSONLint](https://jsonlint.com/)
- [JSON Formatter](https://jsonformatter.curiousconcept.com/)

### 本地验证
您可以使用以下JavaScript代码验证格式：

```javascript
function validateImportData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.keywords || !Array.isArray(data.keywords)) {
      return { valid: false, error: "缺少keywords数组" };
    }
    
    for (let i = 0; i < data.keywords.length; i++) {
      const keyword = data.keywords[i];
      
      if (!keyword.keyword || typeof keyword.keyword !== 'string') {
        return { valid: false, error: `关键字[${i}]缺少keyword字段` };
      }
      
      if (!keyword.url || typeof keyword.url !== 'string') {
        return { valid: false, error: `关键字[${i}]缺少url字段` };
      }
      
      // 验证URL格式
      try {
        new URL(keyword.url);
      } catch (e) {
        return { valid: false, error: `关键字[${i}]的URL格式无效` };
      }
      
      // 验证关键字格式
      if (!/^[a-zA-Z0-9_-]+$/.test(keyword.keyword)) {
        return { valid: false, error: `关键字[${i}]格式无效，只能包含字母、数字、下划线和连字符` };
      }
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: "JSON格式错误: " + e.message };
  }
}
```

## 📁 示例文件

项目中包含以下示例文件：
- `sample-import-data.json` - 完整格式示例
- 您也可以先导出现有配置作为模板

## 🚀 导入步骤

1. **准备文件**：按照上述格式创建JSON文件
2. **验证格式**：使用在线工具或本地验证
3. **导入文件**：
   - 点击插件的"导入"按钮
   - 选择您的JSON文件
   - 选择导入模式（替换/合并）
   - 确认导入

## 💡 最佳实践

1. **备份现有配置**：导入前先导出当前配置作为备份
2. **小批量测试**：先用少量数据测试导入功能
3. **验证数据**：导入前验证JSON格式和数据有效性
4. **使用描述**：为关键字添加描述，便于管理
5. **命名规范**：使用一致的关键字命名规范

现在您就可以创建自己的导入文件了！🎉