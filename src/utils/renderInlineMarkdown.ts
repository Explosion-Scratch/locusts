import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export function renderInlineMarkdown(value = '') {
  return md.renderInline(value);
}
