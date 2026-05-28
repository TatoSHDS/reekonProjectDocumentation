<template>
  <aside class="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shrink-0 hidden md:block pt-8 overflow-y-auto h-[calc(100vh-4rem)] sticky top-16 transition-colors duration-300">
    <nav class="px-4 pb-8">
      <div class="mb-8">
        <h3 class="px-3 mb-3 text-xs font-semibold text-slate-900 dark:text-slate-400 uppercase tracking-wider">
          Getting Started
        </h3>
        <div class="space-y-1">
          <router-link 
            v-for="item in navItems" 
            :key="item.slug" 
            :to="`/${item.slug}`"
            class="nav-link block"
            active-class="active"
          >
            {{ item.title }}
          </router-link>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { fetchSections, Section } from '@/services/directus';

export default defineComponent({
  name: 'AppSidebar',
  setup() {
    const navItems = ref<Section[]>([]);

    onMounted(async () => {
      navItems.value = await fetchSections();
    });

    return {
      navItems
    };
  }
});
</script>

<style scoped>
/* Simplified nav styles are now in tailwind.css */
</style>
