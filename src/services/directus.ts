import { createDirectus, rest, readItems } from '@directus/sdk';

export interface Section {
  id: number;
  slug: string;
  title: string;
  content: string;
  image_url?: string;
  order: number;
}

// Directus base URL used for asset URLs and markdown image paths
export const DIRECTUS_BASE_URL = 'http://localhost:8055';

// Create a Directus client
export const directus = createDirectus(DIRECTUS_BASE_URL).with(rest());

// Mock data in case Directus is unreachable
const mockSections: Section[] = [
  {
    id: 1,
    slug: 'fine-tuning-cli',
    title: 'Fine-tuning CLI',
    content: '## Fine-tuning CLI Documentation\n\nThis section covers the usability manual for the fine-tuning CLI oriented towards PCI MPOC cybersecurity applications.\n\n### Usage\n```bash\nreekon-ft --model llama-3 --dataset pci-mpoc\n```',
    order: 1
  },
  {
    id: 2,
    slug: 'benchmarking-cli',
    title: 'Benchmarking CLI',
    content: '## Benchmarking CLI Documentation\n\nThis section covers the benchmarking process to evaluate model performance on microchip security tasks.\n\n### Usage\n```bash\nreekon-bm --evaluate\n```',
    order: 2
  },
  {
    id: 3,
    slug: 'sampling-functions',
    title: 'Sampling of Functions',
    content: '## Sampling of Functions\n\nHere are sample functions with source images demonstrating the fine-tuning process improvements.',
    image_url: 'https://via.placeholder.com/800x400/0f172a/00f0ff?text=Sample+Architecture',
    order: 3
  },
  {
    id: 4,
    slug: 'research-insights',
    title: 'Research Insights',
    content: '## Insights along the research pathway\n\n1. Initial fine-tuning required significant dataset curation.\n2. Lora adapters provided best balance of speed and accuracy.\n3. PCI MPOC certification scenarios are highly sensitive to prompt structure.',
    order: 4
  }
];

export async function fetchSections(): Promise<Section[]> {
  try {
    // Attempt to fetch from Directus
    const sections = await directus.request(readItems('sections', {
      sort: ['order']
    }));
    return sections as Section[];
  } catch (error) {
    console.warn('Directus is unreachable or collection is missing. Using mock data.');
    return mockSections;
  }
}

export async function fetchSectionBySlug(slug: string): Promise<Section | null> {
  try {
    const sections = await directus.request(readItems('sections', {
      filter: { slug: { _eq: slug } }
    }));
    return sections.length > 0 ? (sections[0] as Section) : null;
  } catch (error) {
    console.warn('Directus is unreachable. Using mock data.');
    const section = mockSections.find(s => s.slug === slug);
    return section || null;
  }
}

export async function searchSections(query: string): Promise<Section[]> {
  if (!query) return [];
  
  try {
    const sections = await directus.request(readItems('sections', {
      search: query,
      limit: 5,
      fields: ['slug', 'title', 'content'] as any
    }));
    return sections as Section[];
  } catch (error) {
    console.warn('Directus search failed. Using mock search.');
    const lowerQuery = query.toLowerCase();
    return mockSections.filter(s => 
      s.title.toLowerCase().includes(lowerQuery) || 
      s.content.toLowerCase().includes(lowerQuery)
    );
  }
}
