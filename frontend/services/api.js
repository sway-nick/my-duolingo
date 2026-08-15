import { WORDS, IRREGULAR_VERBS } from './initialData.js';
import { StorageService } from './storageService.js';

class ApiServiceImpl {
  constructor() {
    this.defaultUrl = 'https://script.google.com/macros/s/AKfycby0lLhpcGJOddZ6L64_D5i14zcU1ZdCtkgA3sj1G9w36eelkGPP4M6k2iTZekTGFAHhFg/exec';
  }

  get baseUrl() {
    return StorageService.getSettings().apiUrl || this.defaultUrl;
  }

  setApiUrl(url) {
    StorageService.updateSettings({ apiUrl: url });
  }

  isOnline() {
    return navigator.onLine;
  }

  async fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async getHealth() {
    if (!this.isOnline()) return { status: 'offline' };
    try {
      const res = await this.fetchWithTimeout(`${this.baseUrl}?route=health`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API Health check failed', e);
    }
    return { status: 'offline' };
  }

  async getWords() {
    if (!this.isOnline()) return WORDS;
    try {
      const res = await this.fetchWithTimeout(`${this.baseUrl}?route=words`);
      if (res.ok) {
        const data = await res.json();
        return data.words || WORDS;
      }
    } catch (e) {
      console.warn('Fetching words from API failed, using fallback', e);
    }
    return WORDS;
  }

  async getIrregularVerbs() {
    if (!this.isOnline()) return IRREGULAR_VERBS;
    try {
      const res = await this.fetchWithTimeout(`${this.baseUrl}?route=irregular_verbs`);
      if (res.ok) {
        const data = await res.json();
        return data.verbs || IRREGULAR_VERBS;
      }
    } catch (e) {
      console.warn('Fetching irregular verbs from API failed, using fallback', e);
    }
    return IRREGULAR_VERBS;
  }

  async saveProgress(data) {
    if (!this.isOnline()) return false;
    try {
      const res = await this.fetchWithTimeout(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ route: 'progress', data })
      });
      return res.ok;
    } catch (e) {
      console.warn('Saving progress to API failed', e);
      return false;
    }
  }

  async loadProgress() {
    if (!this.isOnline()) return null;
    try {
      const res = await this.fetchWithTimeout(`${this.baseUrl}?route=progress`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Loading progress from API failed', e);
    }
    return null;
  }
}

export const ApiService = new ApiServiceImpl();
