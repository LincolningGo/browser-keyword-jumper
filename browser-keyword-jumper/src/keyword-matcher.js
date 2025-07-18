/**
 * 增强的关键字匹配引擎
 * Enhanced Keyword Matching Engine
 */
class KeywordMatcher {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  }

  /**
   * 匹配关键字 - 支持模糊匹配
   */
  async matchKeyword(input, keywords) {
    if (!input || typeof input !== 'string') {
      return { found: false, config: null, score: 0 };
    }

    const trimmedInput = input.trim().toLowerCase();
    if (!trimmedInput) {
      return { found: false, config: null, score: 0 };
    }

    // 检查缓存
    const cacheKey = `${trimmedInput}_${this._getKeywordsHash(keywords)}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // 首先尝试精确匹配
    const exactMatch = this._exactMatch(trimmedInput, keywords);
    if (exactMatch.found) {
      this._setCache(cacheKey, exactMatch);
      return exactMatch;
    }

    // 模糊匹配
    const fuzzyMatch = this._fuzzyMatch(trimmedInput, keywords);
    this._setCache(cacheKey, fuzzyMatch);
    return fuzzyMatch;
  }

  /**
   * 获取多个匹配结果（用于建议系统）
   */
  async getMatches(input, keywords, limit = 5) {
    if (!input || typeof input !== 'string' || !Array.isArray(keywords)) {
      return [];
    }

    const trimmedInput = input.trim().toLowerCase();
    if (!trimmedInput) {
      return [];
    }

    const matches = [];

    for (const keyword of keywords) {
      const keywordLower = keyword.keyword.toLowerCase();
      
      // 精确匹配
      if (keywordLower === trimmedInput) {
        matches.push({ found: true, config: keyword, score: 1.0, type: 'exact' });
        continue;
      }

      // 前缀匹配
      if (keywordLower.startsWith(trimmedInput)) {
        const score = 0.9 - (keywordLower.length - trimmedInput.length) * 0.01;
        matches.push({ found: true, config: keyword, score: Math.max(score, 0.5), type: 'prefix' });
        continue;
      }

      // 包含匹配
      if (keywordLower.includes(trimmedInput)) {
        const score = 0.7 - (keywordLower.length - trimmedInput.length) * 0.01;
        matches.push({ found: true, config: keyword, score: Math.max(score, 0.3), type: 'contains' });
        continue;
      }

      // 模糊匹配（编辑距离）
      const fuzzyScore = this._calculateFuzzyScore(trimmedInput, keywordLower);
      if (fuzzyScore > 0.4) {
        matches.push({ found: true, config: keyword, score: fuzzyScore, type: 'fuzzy' });
      }
    }

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 精确匹配
   */
  _exactMatch(input, keywords) {
    for (const keyword of keywords) {
      if (keyword.keyword.toLowerCase() === input) {
        return { found: true, config: keyword, score: 1.0 };
      }
    }
    return { found: false, config: null, score: 0 };
  }

  /**
   * 模糊匹配
   */
  _fuzzyMatch(input, keywords) {
    let bestMatch = { found: false, config: null, score: 0 };

    for (const keyword of keywords) {
      const keywordLower = keyword.keyword.toLowerCase();
      const score = this._calculateFuzzyScore(input, keywordLower);
      
      if (score > bestMatch.score && score > 0.5) {
        bestMatch = { found: true, config: keyword, score };
      }
    }

    return bestMatch;
  }

  /**
   * 计算模糊匹配分数（编辑距离算法）
   */
  _calculateFuzzyScore(input, keyword) {
    if (input === keyword) return 1.0;
    if (input.length === 0 || keyword.length === 0) return 0;

    const distance = this._levenshteinDistance(input, keyword);
    const maxLength = Math.max(input.length, keyword.length);
    let similarity = 1 - (distance / maxLength);

    // 给前缀匹配额外加分
    if (keyword.startsWith(input)) {
      similarity = Math.min(similarity + 0.2, 1.0);
    }

    // 给包含匹配加分
    if (keyword.includes(input)) {
      similarity = Math.min(similarity + 0.1, 1.0);
    }

    return similarity;
  }

  /**
   * 计算编辑距离
   */
  _levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // 替换
            matrix[i][j - 1] + 1,     // 插入
            matrix[i - 1][j] + 1      // 删除
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 生成关键字哈希
   */
  _getKeywordsHash(keywords) {
    const str = keywords.map(k => `${k.id}_${k.keyword}`).join('|');
    return this._simpleHash(str);
  }

  /**
   * 简单哈希函数
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * 缓存相关方法
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  _setCache(key, result) {
    if (this.cache.size >= 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      result: { ...result },
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

// 导出
if (typeof window !== 'undefined') {
  window.KeywordMatcher = KeywordMatcher;
}