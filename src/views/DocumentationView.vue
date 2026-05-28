<template>
  <div class="animate-in fade-in duration-500">
    <div v-if="loading" class="flex flex-col gap-6">
      <div class="h-10 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      <div class="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse mt-8"></div>
      <div class="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      <div class="h-4 w-4/6 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
    </div>
    
    <div v-else-if="section">
      <header class="mb-10">
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">{{ section.title }}</h1>
        <hr class="border-slate-200 dark:border-slate-800" />
      </header>

      <div v-if="section.image_url" class="mb-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative group">
        <img :src="section.image_url" :alt="section.title" class="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500" />
      </div>

      <div class="prose max-w-none" v-html="parsedContent"></div>
    </div>
    
    <div v-else class="flex flex-col items-center justify-center pt-24 text-center">
      <div class="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <h2 class="text-xl font-semibold text-slate-700 mb-2">Page Not Found</h2>
      <p class="text-slate-500 max-w-md">The documentation page you are looking for does not exist.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchSectionBySlug, Section } from '@/services/directus';
import { marked } from 'marked';

export default defineComponent({
  name: 'DocumentationView',
  setup() {
    const route = useRoute();
    const section = ref<Section | null>(null);
    const parsedContent = ref<string>('');
    const loading = ref(true);

    const loadData = async (slug: string) => {
      loading.value = true;
      try {
        section.value = await fetchSectionBySlug(slug);
        if (section.value) {
          parsedContent.value = marked.parse(section.value.content) as string;
        }
      } catch (e) {
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      const slug = (route.params.slug as string) || 'fine-tuning-cli';
      loadData(slug);
    });

    watch(
      () => route.params.slug,
      (newSlug) => {
        if (newSlug) {
          loadData(newSlug as string);
        }
      }
    );

    return {
      section,
      parsedContent,
      loading
    };
  }
});
</script>

<style>
@reference "../assets/tailwind.css";

/* Light mode typography tweaks */
.prose h2 {
  @apply text-2xl font-bold mt-10 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800;
}
.prose h3 {
  @apply text-lg font-semibold mt-8 mb-3 text-slate-800 dark:text-slate-200;
}
.prose a {
  @apply text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 underline underline-offset-2;
}
.prose strong {
  @apply text-slate-900 dark:text-slate-100 font-bold;
}
.prose p {
  @apply leading-7 mb-5 text-slate-600 dark:text-slate-400;
}
.prose ul {
  @apply list-disc list-inside space-y-1 mb-5 text-slate-600 dark:text-slate-400;
}
.prose ol {
  @apply list-decimal list-inside space-y-1 mb-5 text-slate-600 dark:text-slate-400;
}
.prose pre {
  @apply p-4 rounded-lg overflow-x-auto mb-5 text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800;
}
.prose pre code {
  @apply bg-transparent p-0 border-0 text-inherit;
}
.prose code {
  @apply font-mono text-[0.875em] text-brand-600 dark:text-brand-300 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700;
}
.prose table {
  @apply w-full text-left border-collapse my-6 overflow-hidden rounded-lg;
}
.prose th {
  @apply bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-200 font-semibold px-4 py-3 border border-slate-200 dark:border-slate-700;
}
.prose td {
  @apply text-slate-600 dark:text-slate-400 px-4 py-3 border border-slate-200 dark:border-slate-700;
}
.prose tr:nth-child(even) td {
  @apply bg-slate-50/50 dark:bg-slate-800/20;
}
</style>
