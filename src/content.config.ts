import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    description: z.string(),
    descriptionEn: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// 英文正文：与 blog 一一对应（同 id），只用于正文渲染，元数据仍取自 blog
const blogEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-en' }),
  schema: z.object({}),
});

export const collections = { blog, blogEn };
