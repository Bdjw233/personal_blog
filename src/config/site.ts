import { profile, siteUrl } from '../data/profile';

/**
 * 站点级元信息。页面级标题/描述在各自页面里通过 <BaseLayout /> 传入。
 * 域名只改 src/data/profile.ts 里的 siteUrl。
 */
export const siteConfig = {
  url: siteUrl,
  name: profile.name,
  nameShort: profile.nameShort,
  role: profile.role,
  description: {
    zh: '沈宇轩 — 数据分析与大模型方向的全栈开发者。香港浸会大学数据分析与人工智能硕士在读，写数据清洗、RAG 与前端工程。',
    en: 'Shen Yuxuan — data and LLM-focused full-stack developer. M.Sc. in Data Analytics & AI at HKBU, writing about data cleaning, RAG and frontend engineering.',
  },
  author: profile.name,
  email: profile.email,
  social: {
    github: profile.github,
    linkedin: profile.linkedin,
    email: `mailto:${profile.email}`,
    wechat: profile.wechat,
    phone: profile.phone,
  },
  themeColor: { dark: '#0f1310', light: '#f8f4ec' },
};
