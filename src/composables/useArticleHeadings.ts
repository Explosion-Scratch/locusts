export type ArticleHeading = {
  id: string;
  text: string;
  level: number;
};

export function collectArticleHeadings(): ArticleHeading[] {
  const article = document.querySelector(".article-content");
  if (!article) return [];

  const headings = article.querySelectorAll("h2, h3, h4, h5");
  return Array.from(headings).map((el) => {
    if (!el.id) {
      el.id = (el.textContent || "")
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }
    return {
      id: el.id,
      text: (el.textContent || "").replace(/#$/, "").trim(),
      level: parseInt(el.tagName[1], 10),
    };
  });
}
