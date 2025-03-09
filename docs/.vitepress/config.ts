import { defineConfig } from "vitepress";
const now_year = new Date().getFullYear();
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Youzi's Blog",
  description: "TypeScript React Vue Nestjs JavaScript blog",
  head: [["link", { rel: "icon", href: "/favicon.jpg" }]],
  themeConfig: {
    logo: "/logo2.jpg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "文章", link: "/TypeScript/TypeScript类型体操实践" }],
    sidebar: [
      {
        text: "TypeScript",
        collapsed: false,
        items: [
          { text: "TypeScript类型体操实践", link: "/TypeScript/TypeScript类型体操实践" },
          { text: "TypeScript装饰器学习", link: "/TypeScript/TypeScript装饰器学习" },
        ],
      },
      {
        text: "Vue",
        collapsed: false,
        items: [
          { text: "Vue3.0学习笔记", link: "/Vue/Vue3.0学习笔记" },
          { text: "Pinia学习笔记", link: "/Vue/Pinia学习笔记" },
          { text: "Vue-Router4学习笔记", link: "/Vue/Vue-Router4学习笔记" },
        ],
      },
      {
        text: "JavaScript",
        collapsed: false,
        items: [{ text: "Javascript_ES6新特性学习", link: "/JavaScript/Javascript_ES6新特性学习" }],
      },
      {
        text: "Java",
        collapsed: false,
        items: [{ text: "Java基础个人笔记", link: "/Java/Java基础个人笔记" }],
      },
      {
        text: "数据结构与算法",
        collapsed: false,
        items: [
          { text: "二叉堆-最小堆&最大堆", link: "/数据结构与算法/二叉堆-最小堆&最大堆" },
          { text: "动态规划", link: "/数据结构与算法/动态规划" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/Youzi2233" }],
    footer: {
      message: "Released under the MIT License.",
      copyright: `Copyright © 2022-${now_year} youzi`,
    },
  },
});
