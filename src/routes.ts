const articleModules = import.meta.glob('../content/*.md');

function slugFromPath(path) {
  const filename = path.split('/').pop();
  return filename.replace(/\.md$/, '');
}

export const routes = [
  {
    path: '/',
    component: () => import('./pages/index.vue'),
  },
  ...Object.keys(articleModules).map((path) => {
    const slug = slugFromPath(path);
    return {
      path: `/${slug}`,
      component: articleModules[path],
      meta: { slug },
    };
  }),
];

export function getArticleList() {
  const modules = import.meta.glob('../content/*.md', { eager: true });
  return Object.entries(modules).map(([path, mod]) => {
    const slug = slugFromPath(path);
    const fm = (mod as any).frontmatter || {};
    return {
      slug,
      title: fm.title || slug,
      subtitle: fm.subtitle || '',
      date: fm.date || '',
      author: fm.author || '',
    };
  });
}
