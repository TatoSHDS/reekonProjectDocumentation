<template>
  <header class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300">
    <div class="flex h-16 items-center px-6 max-w-[1440px] mx-auto w-full">
      
      <!-- Logo -->
      <div class="flex items-center gap-2 mr-8">
        <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <span class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">REEKON PROJECT</span>
      </div>

      <!-- Center Nav / Search Placeholder -->
      <div class="flex-1 flex items-center justify-start">
        <div class="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a href="#" class="text-brand-600 dark:text-brand-400">Documentation</a>
          <a href="#" class="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">API Reference</a>
          <a href="#" class="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">GitHub</a>
        </div>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-4">
        <div ref="searchRoot" class="hidden md:flex relative group">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/></svg>
          </div>
          <input
            v-model="searchQuery"
            @input="onSearchInput"
            @keydown="onSearchKeydown"
            type="search"
            class="block w-full p-2 pl-10 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 focus:ring-brand-500 focus:border-brand-500 outline-none w-64 transition-all placeholder-slate-400"
            placeholder="Search documentation..."
            aria-label="Search documentation"
          />

          <div v-if="showResults && searchResults.length > 0" class="absolute left-0 top-full mt-2 w-full max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 shadow-lg text-sm z-50">
            <ul class="divide-y divide-slate-200 dark:divide-slate-800">
              <li v-for="(result, index) in searchResults" :key="result.id">
                <button
                  type="button"
                  @click="goToResult(result.slug)"
                  @mouseenter="activeIndex = index"
                  :class="[
                    'w-full text-left px-4 py-3 transition-colors',
                    activeIndex === index ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  ]"
                >
                  <span class="block font-semibold text-slate-900 dark:text-slate-100">{{ result.title }}</span>
                  <span class="block text-xs text-slate-500 dark:text-slate-400 mt-1" v-html="highlightSnippet(result.content ?? '', searchQuery)"></span>
                </button>
              </li>
            </ul>
          </div>

          <div v-else-if="showResults && searchQuery.trim().length > 0" class="absolute left-0 top-full mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 shadow-lg text-sm z-50 px-4 py-3 text-slate-500 dark:text-slate-400">
            No documentation matches your search.
          </div>
        </div>
        
        <!-- Dark Mode Toggle -->
        <button @click="toggleTheme" class="p-2 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle Dark Mode">
          <!-- Moon Icon for Light Mode -->
          <svg v-if="!isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          <!-- Sun Icon for Dark Mode -->
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </button>
      </div>

    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { searchSections, Section } from '@/services/directus';

export default defineComponent({
  name: 'TopHeader',
  setup() {
    const router = useRouter();
    const isDark = ref(false);
    const searchQuery = ref('');
    const searchResults = ref<Section[]>([]);
    const showResults = ref(false);
    let searchTimer: number | null = null;

    const updateTheme = () => {
      if (isDark.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    const toggleTheme = () => {
      isDark.value = !isDark.value;
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
      updateTheme();
    };

    const searchRoot = ref<HTMLElement | null>(null);
    const activeIndex = ref(-1);

    const onDocumentClick = (event: MouseEvent) => {
      const root = searchRoot.value;
      if (!root) return;
      const target = event.target as Node | null;
      if (target && !root.contains(target)) {
        showResults.value = false;
      }
    };

    const escapeHtml = (value: string) => {
      return value.replace(/[&<>'"]/g, (char) => {
        switch (char) {
          case '&': return '&amp;';
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '"': return '&quot;';
          case "'": return '&#39;';
          default: return char;
        }
      });
    };

    const highlightSnippet = (text: string, query: string) => {
      if (!query.trim()) {
        return escapeHtml(text.slice(0, 120)) + (text.length > 120 ? '...' : '');
      }

      const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedQuery, 'gi');
      const match = regex.exec(text);

      let snippet = text;
      if (match) {
        const start = Math.max(0, match.index - 36);
        const end = Math.min(text.length, match.index + match[0].length + 48);
        snippet = `${start > 0 ? '...' : ''}${text.slice(start, end)}${end < text.length ? '...' : ''}`;
      } else {
        snippet = text.slice(0, 120) + (text.length > 120 ? '...' : '');
      }

      return escapeHtml(snippet).replace(regex, (found) => `
        <mark class="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200 rounded px-1">${escapeHtml(found)}</mark>
      `);
    };

    const performSearch = async (query: string) => {
      if (!query.trim()) {
        searchResults.value = [];
        activeIndex.value = -1;
        return;
      }

      searchResults.value = await searchSections(query.trim());
      activeIndex.value = searchResults.value.length > 0 ? 0 : -1;
    };

    const resetSearch = () => {
      searchQuery.value = '';
      searchResults.value = [];
      showResults.value = false;
      activeIndex.value = -1;
    };

    const onSearchInput = () => {
      showResults.value = !!searchQuery.value.trim();
      activeIndex.value = -1;

      if (searchTimer) {
        window.clearTimeout(searchTimer);
      }

      searchTimer = window.setTimeout(async () => {
        await performSearch(searchQuery.value);
      }, 200);
    };

    const goToResult = (slug: string) => {
      resetSearch();
      router.push({ path: `/${slug}` });
    };

    const onSearchKeydown = async (event: KeyboardEvent) => {
      if (!searchResults.value.length) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeIndex.value = (activeIndex.value + 1) % searchResults.value.length;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeIndex.value = activeIndex.value <= 0 ? searchResults.value.length - 1 : activeIndex.value - 1;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        const result = searchResults.value[activeIndex.value] || searchResults.value[0];
        if (result) {
          goToResult(result.slug);
        }
      }

      if (event.key === 'Escape') {
        showResults.value = false;
      }
    };

    watch(searchQuery, (query) => {
      if (!query.trim()) {
        searchResults.value = [];
        showResults.value = false;
        activeIndex.value = -1;
      }
    });

    onMounted(() => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        isDark.value = savedTheme === 'dark';
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      updateTheme();
      document.addEventListener('click', onDocumentClick, true);
    });

    onUnmounted(() => {
      document.removeEventListener('click', onDocumentClick, true);
    });

    return {
      isDark,
      toggleTheme,
      searchQuery,
      searchResults,
      showResults,
      searchRoot,
      activeIndex,
      highlightSnippet,
      onSearchInput,
      onSearchKeydown,
      goToResult
    };
  }
});
</script>
