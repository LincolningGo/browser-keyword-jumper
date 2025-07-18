// 增强的后台脚本 - 支持模糊匹配
console.log('🚀 Browser Keyword Jumper 启动');

// 导入模糊匹配引擎
importScripts('keyword-matcher.js');

// 存储键
const STORAGE_KEY = 'keywords';

// 默认关键字（空数组，让用户从空白开始）
const DEFAULT_KEYWORDS = [];

let keywords = [];
let keywordMatcher;

// 初始化
async function initialize() {
  try {
    // 初始化匹配引擎
    keywordMatcher = new KeywordMatcher();
    
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    keywords = result[STORAGE_KEY] || DEFAULT_KEYWORDS;
    
    if (!result[STORAGE_KEY]) {
      await chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULT_KEYWORDS });
      console.log('✅ 初始化默认关键字');
    }
    
    console.log(`📋 加载了 ${keywords.length} 个关键字`);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    keywords = DEFAULT_KEYWORDS;
    keywordMatcher = new KeywordMatcher();
  }
}

// 使用简单匹配引擎
async function findMatches(input) {
  return simpleMatch(input);
}

// 简单匹配
function simpleMatch(input) {
  const query = input.toLowerCase().trim();
  if (!query) return [];
  
  const matches = [];
  
  for (const item of keywords) {
    const keyword = item.keyword.toLowerCase();
    
    if (keyword === query) {
      matches.push({ ...item, score: 1.0, type: 'exact' });
    } else if (keyword.startsWith(query)) {
      matches.push({ ...item, score: 0.9, type: 'prefix' });
    } else if (keyword.includes(query)) {
      matches.push({ ...item, score: 0.7, type: 'contains' });
    }
  }
  
  return matches.sort((a, b) => b.score - a.score);
}

// 地址栏输入变化
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (!text || text.trim().length === 0) {
    // 动态更新默认建议
    chrome.omnibox.setDefaultSuggestion({
      description: `输入关键字快速跳转 (共${keywords.length}个关键字)`
    });
    suggest([]);
    return;
  }
  
  const matches = await findMatches(text);
  
  // 如果有精确匹配，只显示精确匹配的结果
  const exactMatches = matches.filter(match => match.type === 'exact');
  const finalMatches = exactMatches.length > 0 ? exactMatches : matches.slice(0, 6);
  
  // 动态更新默认建议
  if (finalMatches.length > 0) {
    const firstMatch = finalMatches[0];
    chrome.omnibox.setDefaultSuggestion({
      description: `${firstMatch.keyword} - ${firstMatch.description || firstMatch.url}`
    });
  } else {
    chrome.omnibox.setDefaultSuggestion({
      description: `未找到匹配的关键字 "${text}"`
    });
  }
  
  const suggestions = finalMatches.map(match => ({
    content: match.keyword,
    description: `${match.keyword} - ${match.description || match.url}`
  }));
  
  suggest(suggestions);
});

// 地址栏输入确认
chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const matches = await findMatches(text);
  let url;
  
  if (matches.length > 0) {
    url = matches[0].url;
  } else {
    url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
  }
  
  // 处理不同的打开方式
  const tabProps = { url: url };
  
  switch (disposition) {
    case 'currentTab':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.update(tabs[0].id, tabProps);
        } else {
          chrome.tabs.create(tabProps);
        }
      });
      break;
    case 'newForegroundTab':
      chrome.tabs.create({ ...tabProps, active: true });
      break;
    case 'newBackgroundTab':
      chrome.tabs.create({ ...tabProps, active: false });
      break;
    default:
      chrome.tabs.create(tabProps);
  }
});

// 处理popup消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getKeywords':
      sendResponse({ success: true, keywords: keywords });
      break;
      
    case 'addKeyword':
      const newKeyword = {
        id: Date.now().toString(),
        keyword: request.keyword,
        url: request.url,
        description: request.description || ''
      };
      keywords.push(newKeyword);
      chrome.storage.sync.set({ [STORAGE_KEY]: keywords });
      sendResponse({ success: true, keyword: newKeyword });
      break;
      
    case 'updateKeyword':
      const index = keywords.findIndex(k => k.id === request.id);
      if (index !== -1) {
        keywords[index] = { ...keywords[index], ...request.updates };
        chrome.storage.sync.set({ [STORAGE_KEY]: keywords });
        sendResponse({ success: true, keyword: keywords[index] });
      } else {
        sendResponse({ success: false, error: '关键字不存在' });
      }
      break;
      
    case 'deleteKeyword':
      const deleteIndex = keywords.findIndex(k => k.id === request.id);
      if (deleteIndex !== -1) {
        const deleted = keywords.splice(deleteIndex, 1)[0];
        chrome.storage.sync.set({ [STORAGE_KEY]: keywords });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: '关键字不存在' });
      }
      break;

    case 'reloadConfigs':
      chrome.storage.sync.get(STORAGE_KEY).then(result => {
        keywords = result[STORAGE_KEY] || [];
        sendResponse({ success: true, count: keywords.length });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true;
});

// 设置默认建议
chrome.omnibox.setDefaultSuggestion({
  description: '输入关键字快速跳转'
});

// 启动初始化
initialize();

console.log('✅ Browser Keyword Jumper 加载完成');