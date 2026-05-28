<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
    <TopHeader />
    
    <div class="flex-1 flex max-w-[1440px] mx-auto w-full relative">
      <AppSidebar />
      <main class="flex-1 min-w-0 pb-24">
        <div class="px-6 md:px-12 py-8 max-w-4xl mx-auto">
          <router-view :key="$route.path" />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppSidebar from '@/components/AppSidebar.vue';
import TopHeader from '@/components/TopHeader.vue';

export default defineComponent({
  name: 'App',
  components: {
    AppSidebar,
    TopHeader
  }
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9; 
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>
