// 简化的popup逻辑
class PopupManager {
  constructor() {
    this.currentEditingId = null;
    this.keywords = [];
    this.filteredKeywords = [];
    this.currentPage = 1;
    this.pageSize = 10;
    this.searchQuery = '';
    this.initElements();
    this.bindEvents();
    this.loadKeywords();
  }

  initElements() {
    this.elements = {
      form: document.getElementById('keyword-form'),
      keywordInput: document.getElementById('keyword-input'),
      urlInput: document.getElementById('url-input'),
      descriptionInput: document.getElementById('description-input'),
      saveBtn: document.getElementById('save-btn'),
      cancelBtn: document.getElementById('cancel-btn'),
      keywordsList: document.getElementById('keywords-list'),
      emptyState: document.getElementById('empty-state'),
      noSearchResults: document.getElementById('no-search-results'),
      keywordCount: document.getElementById('keyword-count'),
      keywordError: document.getElementById('keyword-error'),
      urlError: document.getElementById('url-error'),
      statusMessage: document.getElementById('status-message'),
      // 搜索相关元素
      searchInput: document.getElementById('search-input'),
      clearSearchBtn: document.getElementById('clear-search'),
      searchResultsCount: document.getElementById('search-results-count'),
      // 分页相关元素
      paginationSection: document.getElementById('pagination-section'),
      paginationInfo: document.getElementById('pagination-info-text'),
      prevPageBtn: document.getElementById('prev-page'),
      nextPageBtn: document.getElementById('next-page'),
      pageNumbers: document.getElementById('page-numbers'),
      pageSizeSelect: document.getElementById('page-size-select')
    };
  }

  bindEvents() {
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.elements.cancelBtn.addEventListener('click', () => {
      this.resetForm();
    });

    this.elements.keywordInput.addEventListener('input', () => {
      this.validateKeyword();
    });

    this.elements.urlInput.addEventListener('input', () => {
      this.validateUrl();
    });

    // 搜索功能
    this.elements.searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    this.elements.clearSearchBtn.addEventListener('click', () => {
      this.clearSearch();
    });

    // 分页功能
    this.elements.prevPageBtn.addEventListener('click', () => {
      this.goToPage(this.currentPage - 1);
    });

    this.elements.nextPageBtn.addEventListener('click', () => {
      this.goToPage(this.currentPage + 1);
    });

    this.elements.pageSizeSelect.addEventListener('change', (e) => {
      this.changePageSize(parseInt(e.target.value));
    });

    // 导入导出功能
    document.getElementById('import-btn').addEventListener('click', () => {
      document.getElementById('import-file-input').click();
    });

    document.getElementById('export-btn').addEventListener('click', () => {
      this.exportConfig();
    });

    document.getElementById('import-file-input').addEventListener('change', (e) => {
      this.handleFileImport(e);
    });
  }

  async loadKeywords() {
    try {
      console.log('🔄 开始加载关键字...');
      const response = await chrome.runtime.sendMessage({ action: 'getKeywords' });
      console.log('📨 收到响应:', response);
      
      if (response && response.success) {
        this.keywords = response.keywords || [];
        console.log(`✅ 成功加载 ${this.keywords.length} 个关键字`);
        this.renderKeywords();
        this.updateCount();
      } else {
        console.error('❌ 加载关键字失败:', response);
        this.showStatus('加载关键字失败', 'error');
      }
    } catch (error) {
      console.error('❌ 加载关键字异常:', error);
      this.showStatus('加载关键字失败', 'error');
    }
  }

  renderKeywords() {
    // 应用搜索过滤
    this.applySearch();
    
    if (this.keywords.length === 0) {
      this.elements.keywordsList.style.display = 'none';
      this.elements.emptyState.style.display = 'block';
      this.elements.noSearchResults.style.display = 'none';
      this.elements.paginationSection.style.display = 'none';
      return;
    }

    if (this.filteredKeywords.length === 0) {
      this.elements.keywordsList.style.display = 'none';
      this.elements.emptyState.style.display = 'none';
      this.elements.noSearchResults.style.display = 'block';
      this.elements.paginationSection.style.display = 'none';
      return;
    }

    this.elements.emptyState.style.display = 'none';
    this.elements.noSearchResults.style.display = 'none';
    this.elements.keywordsList.style.display = 'block';

    // 计算分页
    const totalPages = Math.ceil(this.filteredKeywords.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const currentPageKeywords = this.filteredKeywords.slice(startIndex, endIndex);

    // 渲染当前页的关键字
    this.elements.keywordsList.innerHTML = currentPageKeywords.map(keyword => `
      <div class="keyword-item" data-id="${keyword.id}">
        <div class="keyword-info">
          <div class="keyword-name">${this.escapeHtml(keyword.keyword)}</div>
          <div class="keyword-url">${this.escapeHtml(keyword.url)}</div>
          ${keyword.description ? `<div class="keyword-description">${this.escapeHtml(keyword.description)}</div>` : ''}
        </div>
        <div class="keyword-actions">
          <button class="btn btn-outline edit-btn" data-id="${keyword.id}" title="编辑">
            <span class="icon">✏️</span>
          </button>
          <button class="btn btn-outline delete-btn" data-id="${keyword.id}" title="删除">
            <span class="icon">🗑️</span>
          </button>
        </div>
      </div>
    `).join('');

    this.bindActionButtons();
    this.updatePagination();
  }

  bindActionButtons() {
    const editButtons = this.elements.keywordsList.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.editKeyword(id);
      });
    });

    const deleteButtons = this.elements.keywordsList.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.deleteKeyword(id);
      });
    });
  }

  updateCount() {
    this.elements.keywordCount.textContent = this.keywords.length;
  }

  async handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const keyword = this.elements.keywordInput.value.trim();
    const url = this.elements.urlInput.value.trim();
    const description = this.elements.descriptionInput.value.trim();

    try {
      let response;
      if (this.currentEditingId) {
        response = await chrome.runtime.sendMessage({
          action: 'updateKeyword',
          id: this.currentEditingId,
          updates: { keyword, url, description }
        });
      } else {
        response = await chrome.runtime.sendMessage({
          action: 'addKeyword',
          keyword,
          url,
          description
        });
      }

      if (response.success) {
        await this.loadKeywords();
        this.resetForm();
        this.showStatus(
          this.currentEditingId ? '关键字更新成功' : '关键字添加成功',
          'success'
        );
      } else {
        this.showStatus(response.error || '操作失败', 'error');
      }
    } catch (error) {
      console.error('保存失败:', error);
      this.showStatus('保存失败', 'error');
    }
  }

  editKeyword(id) {
    const keyword = this.keywords.find(k => k.id === id);
    if (!keyword) return;

    this.currentEditingId = id;
    this.elements.keywordInput.value = keyword.keyword;
    this.elements.urlInput.value = keyword.url;
    this.elements.descriptionInput.value = keyword.description || '';

    this.elements.saveBtn.innerHTML = '<span class="icon">💾</span><span>更新关键字</span>';
    this.elements.cancelBtn.style.display = 'inline-flex';

    this.elements.keywordInput.focus();
  }

  async deleteKeyword(id) {
    if (!confirm('确定要删除这个关键字吗？')) {
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'deleteKeyword',
        id: id
      });

      if (response.success) {
        await this.loadKeywords();
        this.showStatus('关键字删除成功', 'success');
      } else {
        this.showStatus(response.error || '删除失败', 'error');
      }
    } catch (error) {
      console.error('删除失败:', error);
      this.showStatus('删除失败', 'error');
    }
  }

  resetForm() {
    this.currentEditingId = null;
    this.elements.form.reset();
    this.elements.saveBtn.innerHTML = '<span class="icon">💾</span><span>添加关键字</span>';
    this.elements.cancelBtn.style.display = 'none';
    this.clearErrors();
  }

  validateForm() {
    const keywordValid = this.validateKeyword();
    const urlValid = this.validateUrl();
    return keywordValid && urlValid;
  }

  validateKeyword() {
    const keyword = this.elements.keywordInput.value.trim();
    const errorElement = this.elements.keywordError;

    if (!keyword) {
      this.showFieldError(errorElement, '关键字不能为空');
      return false;
    }

    if (keyword.length > 50) {
      this.showFieldError(errorElement, '关键字长度不能超过50个字符');
      return false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(keyword)) {
      this.showFieldError(errorElement, '关键字只能包含字母、数字、下划线和连字符');
      return false;
    }

    const duplicate = this.keywords.find(k =>
      k.keyword === keyword && k.id !== this.currentEditingId
    );
    if (duplicate) {
      this.showFieldError(errorElement, '关键字已存在');
      return false;
    }

    this.clearFieldError(errorElement);
    return true;
  }

  validateUrl() {
    const url = this.elements.urlInput.value.trim();
    const errorElement = this.elements.urlError;

    if (!url) {
      this.showFieldError(errorElement, '网址不能为空');
      return false;
    }

    try {
      new URL(url);
      this.clearFieldError(errorElement);
      return true;
    } catch (e) {
      this.showFieldError(errorElement, '网址格式无效');
      return false;
    }
  }

  showFieldError(element, message) {
    element.textContent = message;
    element.parentElement.querySelector('input').classList.add('error');
  }

  clearFieldError(element) {
    element.textContent = '';
    element.parentElement.querySelector('input').classList.remove('error');
  }

  clearErrors() {
    this.clearFieldError(this.elements.keywordError);
    this.clearFieldError(this.elements.urlError);
  }

  showStatus(message, type = 'info') {
    const statusElement = this.elements.statusMessage;
    const iconElement = statusElement.querySelector('.status-icon');
    const textElement = statusElement.querySelector('.status-text');

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };

    iconElement.textContent = icons[type] || icons.info;
    textElement.textContent = message;

    statusElement.className = `status-message ${type}`;
    statusElement.style.display = 'flex';

    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 导出配置
  async exportConfig() {
    try {
      const exportData = {
        keywords: this.keywords,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `keyword-jumper-backup-${dateStr}-${timeStr}.json`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showStatus(`配置导出成功 (${this.keywords.length} 个关键字)`, 'success');
    } catch (error) {
      console.error('导出失败:', error);
      this.showStatus('导出失败', 'error');
    }
  }

  // 处理文件导入
  async handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📁 开始导入文件:', file.name);

    // 重置文件输入
    event.target.value = '';

    if (!file.name.endsWith('.json')) {
      this.showStatus('请选择JSON格式的配置文件', 'error');
      return;
    }

    try {
      console.log('📖 读取文件内容...');
      const text = await this.readFileAsText(file);
      console.log('📄 文件内容长度:', text.length);
      
      const importData = JSON.parse(text);
      console.log('🔍 解析的数据结构:', importData);

      // 支持两种格式：直接数组或包含keywords字段的对象
      let keywordsToImport = [];
      
      if (Array.isArray(importData)) {
        // 直接是关键字数组
        keywordsToImport = importData;
        console.log('📋 检测到直接数组格式');
      } else if (importData.keywords && Array.isArray(importData.keywords)) {
        // 包含keywords字段的对象
        keywordsToImport = importData.keywords;
        console.log('📋 检测到标准对象格式');
      } else {
        console.error('❌ 无效的文件格式:', importData);
        this.showStatus('配置文件格式无效，需要包含keywords数组', 'error');
        return;
      }

      console.log(`📊 待导入关键字数量: ${keywordsToImport.length}`);

      // 确认导入
      const keywordCount = keywordsToImport.length;
      const currentCount = this.keywords.length;
      
      if (!confirm(`即将导入 ${keywordCount} 个关键字，当前有 ${currentCount} 个关键字。\n\n导入将替换所有现有配置，确定继续吗？`)) {
        console.log('❌ 用户取消导入');
        return;
      }

      // 验证并处理导入的关键字
      const validKeywords = [];
      let counter = 0;
      
      for (const keyword of keywordsToImport) {
        console.log(`🔍 验证关键字 ${counter + 1}:`, keyword);
        
        if (keyword.keyword && keyword.url) {
          try {
            // 验证URL格式
            new URL(keyword.url.trim());
            
            // 确保每个ID都是唯一的
            const uniqueId = keyword.id || (Date.now() + counter).toString() + Math.random().toString(36).substring(2, 11);
            const validKeyword = {
              id: uniqueId,
              keyword: keyword.keyword.trim(),
              url: keyword.url.trim(),
              description: (keyword.description || '').trim()
            };
            
            validKeywords.push(validKeyword);
            console.log(`✅ 关键字有效:`, validKeyword);
          } catch (urlError) {
            console.warn(`⚠️ 跳过无效URL的关键字:`, keyword, urlError);
          }
        } else {
          console.warn(`⚠️ 跳过不完整的关键字:`, keyword);
        }
        counter++;
      }

      if (validKeywords.length === 0) {
        console.error('❌ 没有找到有效的关键字');
        this.showStatus('没有找到有效的关键字数据', 'error');
        return;
      }

      console.log(`💾 准备保存 ${validKeywords.length} 个有效关键字`);

      // 保存到存储
      await chrome.storage.sync.set({ keywords: validKeywords });
      console.log('✅ 数据已保存到chrome.storage.sync');
      
      // 通知background重新加载配置
      try {
        const reloadResponse = await chrome.runtime.sendMessage({ action: 'reloadConfigs' });
        console.log('🔄 Background重新加载响应:', reloadResponse);
      } catch (error) {
        console.warn('⚠️ 通知background重新加载失败:', error);
      }
      
      // 重新加载本地数据
      console.log('🔄 重新加载本地数据...');
      await this.loadKeywords();
      
      this.showStatus(`导入成功！导入了 ${validKeywords.length} 个关键字`, 'success');
      console.log('🎉 导入完成');
      
    } catch (error) {
      console.error('❌ 导入过程中发生错误:', error);
      if (error instanceof SyntaxError) {
        this.showStatus('配置文件格式错误，请检查JSON格式', 'error');
      } else {
        this.showStatus(`导入失败: ${error.message}`, 'error');
      }
    }
  }

  // 读取文件为文本
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  // 搜索功能
  handleSearch(query) {
    this.searchQuery = query.trim().toLowerCase();
    this.currentPage = 1; // 重置到第一页
    this.renderKeywords();
    this.updateSearchUI();
  }

  applySearch() {
    if (!this.searchQuery) {
      this.filteredKeywords = [...this.keywords].sort((a, b) => b.id - a.id);
    } else {
      this.filteredKeywords = this.keywords.filter(keyword => {
        return keyword.keyword.toLowerCase().includes(this.searchQuery) ||
               keyword.url.toLowerCase().includes(this.searchQuery) ||
               (keyword.description && keyword.description.toLowerCase().includes(this.searchQuery));
      }).sort((a, b) => b.id - a.id);
    }
  }

  updateSearchUI() {
    const hasSearch = this.searchQuery.length > 0;
    
    // 显示/隐藏清除搜索按钮
    this.elements.clearSearchBtn.style.display = hasSearch ? 'block' : 'none';
    
    // 更新搜索结果统计
    if (hasSearch) {
      this.elements.searchResultsCount.textContent = `找到 ${this.filteredKeywords.length} 个匹配结果`;
      this.elements.searchResultsCount.style.display = 'block';
    } else {
      this.elements.searchResultsCount.style.display = 'none';
    }
  }

  clearSearch() {
    this.elements.searchInput.value = '';
    this.searchQuery = '';
    this.currentPage = 1;
    this.renderKeywords();
    this.updateSearchUI();
  }

  // 分页功能
  goToPage(page) {
    const totalPages = Math.ceil(this.filteredKeywords.length / this.pageSize);
    if (page < 1 || page > totalPages) return;
    
    this.currentPage = page;
    this.renderKeywords();
  }

  changePageSize(newSize) {
    this.pageSize = newSize;
    this.currentPage = 1; // 重置到第一页
    this.renderKeywords();
  }

  updatePagination() {
    const totalItems = this.filteredKeywords.length;
    const totalPages = Math.ceil(totalItems / this.pageSize);
    
    if (totalPages <= 1) {
      this.elements.paginationSection.style.display = 'none';
      return;
    }
    
    this.elements.paginationSection.style.display = 'block';
    
    // 更新分页信息
    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(this.currentPage * this.pageSize, totalItems);
    this.elements.paginationInfo.textContent = `显示 ${startItem}-${endItem} 条，共 ${totalItems} 条`;
    
    // 更新上一页/下一页按钮状态
    this.elements.prevPageBtn.disabled = this.currentPage === 1;
    this.elements.nextPageBtn.disabled = this.currentPage === totalPages;
    
    // 生成页码按钮
    this.generatePageNumbers(totalPages);
  }

  generatePageNumbers(totalPages) {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 调整起始页，确保显示足够的页码
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    let pageNumbersHtml = '';
    
    // 第一页和省略号
    if (startPage > 1) {
      pageNumbersHtml += `<button class="page-number ${1 === this.currentPage ? 'active' : ''}" data-page="1">1</button>`;
      if (startPage > 2) {
        pageNumbersHtml += '<span class="page-ellipsis">...</span>';
      }
    }
    
    // 中间页码
    for (let i = startPage; i <= endPage; i++) {
      pageNumbersHtml += `<button class="page-number ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    // 最后一页和省略号
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbersHtml += '<span class="page-ellipsis">...</span>';
      }
      pageNumbersHtml += `<button class="page-number ${totalPages === this.currentPage ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    this.elements.pageNumbers.innerHTML = pageNumbersHtml;
    
    // 绑定页码点击事件
    this.elements.pageNumbers.querySelectorAll('.page-number').forEach(button => {
      button.addEventListener('click', (e) => {
        const page = parseInt(e.target.getAttribute('data-page'));
        this.goToPage(page);
      });
    });
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});