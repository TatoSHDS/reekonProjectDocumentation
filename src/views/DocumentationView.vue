<template>
  <div class="animate-in fade-in duration-500 flex flex-col xl:flex-row gap-8 relative">
    
    <!-- Main Content -->
    <div class="flex-1 min-w-0">
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

        <div ref="contentRoot" class="prose max-w-none" v-html="parsedContent"></div>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center pt-24 text-center">
        <div class="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h2 class="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Page Not Found</h2>
        <p class="text-slate-500 dark:text-slate-400 max-w-md">The documentation page you are looking for does not exist.</p>
      </div>
    </div>
    
    <!-- Table of Contents Sidebar -->
    <aside v-if="!loading && toc.length > 0" class="hidden xl:block w-72 shrink-0">
      <div class="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl bg-white/95 dark:bg-slate-900/95 shadow-sm backdrop-blur-xl">
        <div class="px-4 py-5">
          <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-widest">On this page</h4>
          <nav class="space-y-1.5 border-l-2 border-slate-100 dark:border-slate-800">
            <a 
              v-for="item in toc" 
              :key="item.id" 
              :href="`#${item.id}`"
              :class="[
                'block text-sm py-1 border-l-2 -ml-[2px] transition-colors',
                item.level === 3 ? 'pl-5 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 border-transparent' 
                                 : 'pl-3 font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 border-transparent',
                activeId === item.id ? 'text-brand-600 dark:text-brand-400 border-brand-500 font-semibold' : ''
              ]"
            >
              {{ item.text }}
            </a>
          </nav>
        </div>
      </div>
    </aside>
    
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { fetchSectionBySlug, Section, DIRECTUS_BASE_URL } from '@/services/directus';
import { marked, Renderer } from 'marked';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default defineComponent({
  name: 'DocumentationView',
  setup() {
    const route = useRoute();
    const section = ref<Section | null>(null);
    const parsedContent = ref<string>('');
    const loading = ref(true);
    const toc = ref<TocItem[]>([]);
    const activeId = ref<string>('');
    const contentRoot = ref<HTMLElement | null>(null);
    let scrollRaf: number | null = null;

    const loadData = async (slug: string) => {
      loading.value = true;
      try {
        section.value = await fetchSectionBySlug(slug);
        if (section.value) {
          toc.value = [];
          activeId.value = '';
          
          // Create custom renderer for headings and images
          const renderer = new Renderer();
          const normalizeImageSrc = (href: string) => {
            if (!href) {
              return '';
            }
            if (/^https?:\/\//i.test(href) || href.startsWith('//')) {
              return href;
            }
            return `${DIRECTUS_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
          };

          renderer.heading = (param: any) => {
            // Support multiple marked versions API
            const text = typeof param === 'string' ? param : param.text;
            const depth = typeof param === 'string' ? arguments[1] : param.depth;

            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            if (depth === 2 || depth === 3) {
              toc.value.push({ id, text, level: depth });
            }
            return `<h${depth} id="${id}" class="scroll-mt-24 group">${text} <a href="#${id}" class="opacity-0 group-hover:opacity-100 ml-2 text-brand-500 no-underline transition-opacity">#</a></h${depth}>`;
          };

          parsedContent.value = marked.parse(section.value.content, { renderer }) as string;
          parsedContent.value = parsedContent.value.replace(/(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi, (_match, prefix, src, suffix) => {
            if (/^https?:\/\//i.test(src) || src.startsWith('//') || src.startsWith('data:')) {
              return `${prefix}${src}${suffix}`;
            }
            return `${prefix}${DIRECTUS_BASE_URL}${src.startsWith('/') ? '' : '/'}${src}${suffix}`;
          });
          await nextTick();
          initScrollSpy();
        }
      } catch (e) {
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => route.params.slug,
      (newSlug) => {
        if (newSlug) {
          loadData(newSlug as string);
        }
      }
    );

    const getHeadingElements = () => {
      return contentRoot.value ? Array.from(contentRoot.value.querySelectorAll('h2[id], h3[id]')) as HTMLElement[] : [];
    };

    const updateActiveId = () => {
      const headings = getHeadingElements();
      if (!headings.length) {
        activeId.value = '';
        return;
      }

      const scrollPosition = window.scrollY + 140;
      let currentId = headings[0].id;

      for (const heading of headings) {
        const headingTop = heading.getBoundingClientRect().top + window.scrollY;
        if (headingTop <= scrollPosition) {
          currentId = heading.id;
        }
      }

      activeId.value = currentId;
    };

    const onScroll = () => {
      if (scrollRaf !== null) {
        return;
      }
      scrollRaf = window.requestAnimationFrame(() => {
        updateActiveId();
        scrollRaf = null;
      });
    };

    const initScrollSpy = () => {
      updateActiveId();
    };

    onMounted(() => {
      const slug = (route.params.slug as string) || 'fine-tuning-cli';
      loadData(slug);
      window.addEventListener('scroll', onScroll, { passive: true });
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', onScroll);
    });

    return {
      section,
      parsedContent,
      loading,
      toc,
      activeId,
      contentRoot
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
.prose img {
  @apply block mx-auto my-8 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full object-contain;
  max-height: 600px;
}
</style>
