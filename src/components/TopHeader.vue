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
        <div class="hidden md:flex relative group">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/></svg>
          </div>
          <input type="search" class="block w-full p-2 pl-10 text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 focus:ring-brand-500 focus:border-brand-500 outline-none w-64 transition-all placeholder-slate-400" placeholder="Search documentation..." />
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
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'TopHeader',
  setup() {
    const isDark = ref(false);

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

    onMounted(() => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        isDark.value = savedTheme === 'dark';
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      updateTheme();
    });

    return {
      isDark,
      toggleTheme
    };
  }
});
</script>
