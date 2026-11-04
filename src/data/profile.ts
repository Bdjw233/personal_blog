/**
 * 全站唯一的内容来源（简历 v4 / 2027 届）
 * 每个字段都同时提供中英文，页面用 `<span data-en="...">中文</span>` 渲染，
 * 语言切换只做文本替换，不再维护第二套结构。
 */
export interface I18n {
  zh: string;
  en: string;
}

export const siteUrl = process.env.SITE_URL ?? 'https://Bdjw233.github.io';

export const profile = {
  name: { zh: '沈宇轩', en: 'Shen Yuxuan' } as I18n,
  nameShort: 'SYX',
  /* 一句话定位 */
  role: {
    zh: '数据分析与大模型 · 全栈开发',
    en: 'Data & LLM Engineering · Full-Stack Developer',
  } as I18n,
  headline: {
    zh: '计算机科学荣誉学士 · 数据分析与人工智能硕士在读',
    en: 'Honours B.Sc. in Computer Science · M.Sc. in Data Analytics & AI (in progress)',
  } as I18n,
  cohort: {
    zh: '2027 届 · 现居香港（在读），可即时到岗',
    en: 'Class of 2027 · Based in Hong Kong (studying), available immediately',
  } as I18n,
  intro: {
    zh: '本科在加拿大圭尔夫大学读计算机科学，现在在香港浸会大学读数据分析与人工智能。过去两年在五家公司做过数据、安全、嵌入式开发和前端——跨度大，但共同点是把「能跑」的东西做到「能交付」。',
    en: 'I studied computer science at the University of Guelph in Canada and am now reading data analytics and AI at HKBU in Hong Kong. Over the past two years I have worked across data, security, embedded and frontend roles at five companies — different stacks, same habit: getting things from "it runs" to "it ships".',
  } as I18n,
  tagline: {
    zh: '把原始语料变成可训练的数据集，把模型能力做成别人愿意用的界面。',
    en: 'Turning raw corpora into trainable datasets, and model capability into interfaces people actually use.',
  } as I18n,
  introSecondary: {
    zh: '最近一段在浩鲸云计算做了 8 个月的大模型语料与预处理工作，从多源去重、格式归一、噪声过滤，到样本构造、分词截断与数据配比，完整走过一遍「原始语料到可训练数据集」的链路。',
    en: 'Most recently I spent eight months at Whale Cloud on LLM corpus work and preprocessing — multi-source deduplication, format normalisation, noise filtering, sample construction, tokenisation and data mixing — the full path from raw corpus to a trainable dataset.',
  } as I18n,

  email: 'syx2027f@163.com',
  phone: '+86 158 0518 8711',
  wechat: 'syx15805188711',
  github: 'https://github.com/Bdjw233',
  linkedin: 'https://www.linkedin.com/in/yuxuan-shen-billy',
  location: { zh: '香港 · 南京', en: 'Hong Kong · Nanjing' } as I18n,

  education: [
    {
      school: { zh: '香港浸会大学', en: 'Hong Kong Baptist University' } as I18n,
      degree: { zh: '数据分析与人工智能 · 硕士（在读）', en: 'M.Sc. in Data Analytics and Artificial Intelligence' } as I18n,
      period: '2026.09 – 2027.08',
      current: true,
      note: {
        zh: '预计 2027 年 8 月毕业',
        en: 'Expected graduation: Aug 2027',
      } as I18n,
    },
    {
      school: { zh: '圭尔夫大学', en: 'University of Guelph' } as I18n,
      degree: { zh: '计算机科学 · 荣誉理学学士 (Honours B.Sc.)', en: 'Honours B.Sc. in Computer Science' } as I18n,
      period: '2021.09 – 2025.06',
      current: false,
      note: {
        zh: '主修数据结构与算法、操作系统、计算机网络、数据库系统、软件工程',
        en: 'Coursework: data structures & algorithms, operating systems, computer networks, database systems, software engineering',
      } as I18n,
    },
  ],

  experience: [
    {
      company: { zh: '浩鲸云计算科技股份有限公司', en: 'Whale Cloud Technology' } as I18n,
      title: { zh: '大数据 / 大模型数据实习生', en: 'Data Intern, Big Data & LLM Data' } as I18n,
      period: '2025.12 – 2026.07',
      place: { zh: '南京', en: 'Nanjing' } as I18n,
      current: true,
      points: [
        {
          zh: '参与大模型训练语料的整理与清洗，完成多源数据去重、格式归一与噪声过滤，产出可直接用于训练的数据集。',
          en: 'Cleaned and organised LLM training corpus: multi-source deduplication, format normalisation and noise filtering, producing datasets ready for training.',
        },
        {
          zh: '参与模型预处理环节，按训练要求完成样本构造、分词截断与数据配比，配合算法同学迭代数据版本。',
          en: 'Worked on preprocessing: sample construction, truncation and data mixing per training requirements, iterating dataset versions with the algorithm team.',
        },
        {
          zh: '把重复性的核对工作沉淀为处理脚本与校验规则，减少人工逐条比对。',
          en: 'Turned repetitive verification into scripts and validation rules, cutting manual line-by-line checks.',
        },
      ],
    },
    {
      company: { zh: '高邮市汇金新材料科技有限公司', en: 'Gaoyou Huijin New Materials' } as I18n,
      title: { zh: '网络安全运维实习生', en: 'Security Operations Intern' } as I18n,
      period: '2025.05 – 2025.11',
      place: { zh: '高邮', en: 'Gaoyou' } as I18n,
      current: false,
      points: [
        {
          zh: '负责办公终端与服务器的日常安全巡检：补丁与病毒库更新、弱口令排查、异常外联监测，形成巡检记录。',
          en: 'Ran daily security checks on office endpoints and servers: patch and antivirus updates, weak-password sweeps, anomalous outbound monitoring, with written inspection records.',
        },
        {
          zh: '维护防火墙与上网行为策略，按需开通和回收账号权限，处理员工的安全告警与故障报修。',
          en: 'Maintained firewall and web-access policies, provisioned and revoked accounts, and handled security alerts and fault reports from staff.',
        },
      ],
    },
    {
      company: { zh: '江苏仟略信息技术有限公司', en: 'Jiangsu Qianlue Information Technology' } as I18n,
      title: { zh: '嵌入式开发实习生', en: 'Embedded Development Intern' } as I18n,
      period: '2024.04 – 2024.10',
      place: { zh: '南京', en: 'Nanjing' } as I18n,
      current: false,
      points: [
        {
          zh: '参与嵌入式模块的编码、烧录与调试，配合硬件侧完成接口联调，输出测试记录。',
          en: 'Contributed to coding, flashing and debugging of embedded modules, integrated interfaces with the hardware team and documented test results.',
        },
      ],
    },
    {
      company: { zh: '马鞍山零码科技有限公司', en: 'Ma’anshan Lingma Technology' } as I18n,
      title: { zh: '全栈开发实习生（暑期 + 线上延续）', en: 'Full-Stack Development Intern' } as I18n,
      period: '2023.06 – 2023.12',
      place: { zh: '马鞍山', en: "Ma’anshan" } as I18n,
      current: false,
      points: [
        {
          zh: '暑期在公司线下完成微信小程序端的页面与交互开发，对接后端接口打通业务流程。',
          en: 'Built WeChat Mini Program pages and interactions on site during the summer, wiring backend APIs into complete user flows.',
        },
        {
          zh: '学期内转为线上兼职，参与后台接口与数据表设计，完成前后端联调与版本发布。',
          en: 'Continued remotely during term time: backend API and schema design, front-to-back integration and releases.',
        },
      ],
    },
    {
      company: { zh: '江苏润和软件股份有限公司', en: 'Jiangsu HopeRun Software' } as I18n,
      title: { zh: '前端开发实习生', en: 'Frontend Development Intern' } as I18n,
      period: '2023.04 – 2023.06',
      place: { zh: '南京', en: 'Nanjing' } as I18n,
      current: false,
      points: [
        {
          zh: '使用 Vue 参与多个内部业务项目的页面开发，按设计稿还原界面并对接接口。',
          en: 'Built pages for several internal projects in Vue, matching design specs and integrating APIs.',
        },
        {
          zh: '配合团队完成缺陷修复与联调，保证迭代按期交付。',
          en: 'Worked with the team on bug fixing and integration to keep iterations on schedule.',
        },
      ],
    },
    {
      company: { zh: '南京聚喜文化传播有限公司', en: 'Nanjing Juxi Culture Communication' } as I18n,
      title: { zh: 'IT 支持（兼职）', en: 'IT Support (Part-time)' } as I18n,
      period: '2022.01 – 2022.12',
      place: { zh: '南京', en: 'Nanjing' } as I18n,
      current: false,
      points: [
        {
          zh: '负责办公网络、电脑与账号权限的日常维护，处理员工的软硬件问题。',
          en: 'Maintained office network, machines and account permissions; handled hardware and software issues for staff.',
        },
        {
          zh: '参与公司官网与活动页的简单页面开发及内容更新。',
          en: 'Helped build and update simple pages for the company website and campaign pages.',
        },
      ],
    },
  ],

  skillGroups: [
    {
      label: { zh: '编程语言', en: 'Languages' } as I18n,
      items: 'Python · JavaScript / TypeScript · C · SQL · Node.js',
    },
    {
      label: { zh: '数据与 AI', en: 'Data & AI' } as I18n,
      items: { zh: '数据清洗与预处理 · Pandas / NumPy · 大模型语料整理', en: 'Data cleaning & preprocessing · Pandas / NumPy · LLM corpus curation' } as I18n,
    },
    {
      label: { zh: '前端', en: 'Frontend' } as I18n,
      items: { zh: 'Vue · 微信小程序 · HTML / CSS', en: 'Vue · WeChat Mini Program · HTML / CSS' } as I18n,
    },
    {
      label: { zh: '工具', en: 'Tooling' } as I18n,
      items: { zh: 'Git · Linux · Docker · Office 工具集', en: 'Git · Linux · Docker · Office suite' } as I18n,
    },
    {
      label: { zh: '语言', en: 'Spoken' } as I18n,
      items: {
        zh: '英语（可作工作语言）· 法语（日常）· 粤语（日常）· 普通话（母语）',
        en: 'English (working proficiency) · French (conversational) · Cantonese (conversational) · Mandarin (native)',
      } as I18n,
    },
  ],

  projects: [
    {
      name: { zh: '口腔诊所智能接诊系统', en: 'Dental Clinic Reception System' } as I18n,
      role: { zh: '项目经理 / 独立开发', en: 'Project lead & solo developer' } as I18n,
      period: '2025.05 – 2025.08',
      summary: {
        zh: '面向中小型口腔诊所的接诊管理平台，把预约、接诊、治疗记录和复诊提醒串成一条流程，替代原来散落在纸质表格和微信里的记录。',
        en: 'A reception and treatment workflow for small dental clinics — appointments, check-ins, treatment records and recall reminders in one flow instead of paper forms and scattered WeChat threads.',
      } as I18n,
      highlights: [
        {
          zh: '独立完成前端、后端与测试，从需求梳理到上线全流程负责。',
          en: 'Owned frontend, backend and testing end to end, from requirement scoping to launch.',
        },
        {
          zh: '用状态机管接诊流程，避免「已到诊 / 治疗中 / 已完成」状态错乱导致的排班冲突。',
          en: 'Modelled the reception flow as a state machine to prevent scheduling conflicts from inconsistent statuses.',
        },
      ],
      stack: ['Vue', 'Python', 'SQLite', 'REST API'],
      link: 'https://github.com/Bdjw233',
    },
    {
      name: { zh: '个人站点（本站）', en: 'Personal Site (this one)' } as I18n,
      role: { zh: '设计 / 开发', en: 'Design & development' } as I18n,
      period: '2026',
      summary: {
        zh: '用 Astro + Tailwind 做的静态站点：内容集合管理文章，明暗两套主题，中英双语切换不刷新页面。',
        en: 'A static site built with Astro and Tailwind: content collections for posts, two themes, and language switching without a reload.',
      } as I18n,
      highlights: [
        {
          zh: '主题与语言状态在首屏渲染前注入，避免闪白 / 闪中文。',
          en: 'Theme and language are applied before first paint to avoid flashes.',
        },
      ],
      stack: ['Astro', 'Tailwind CSS', 'TypeScript'],
      link: 'https://github.com/Bdjw233',
    },
  ],
};

export const nav = [
  { href: '/', zh: '首页', en: 'Home' },
  { href: '/about', zh: '关于', en: 'About' },
  { href: '/projects', zh: '项目', en: 'Projects' },
  { href: '/blog', zh: '博客', en: 'Blog' },
  { href: '/contact', zh: '联系', en: 'Contact' },
];
