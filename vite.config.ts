import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Markdown from 'unplugin-vue-markdown/vite';
import Components from 'unplugin-vue-components/vite';
import anchor from 'markdown-it-anchor';
import footnote from 'markdown-it-footnote';
import { resolve } from 'path';
import { mkdirSync, readdirSync, copyFileSync, cpSync, existsSync } from 'fs';
import fluidTypographyPlugin from './src/styles/fluid-typography.js';

const srcImagesDir = resolve(__dirname, 'src/assets/images');
const destImagesDir = resolve(__dirname, 'public/assets/images');
if (existsSync(srcImagesDir)) {
  mkdirSync(destImagesDir, { recursive: true });
  const files = readdirSync(srcImagesDir);
  for (const file of files) {
    copyFileSync(resolve(srcImagesDir, file), resolve(destImagesDir, file));
  }
}

const srcLocustsDir = resolve(__dirname, 'src/assets/locusts');
const destLocustsDir = resolve(__dirname, 'public/assets/locusts');
if (existsSync(srcLocustsDir)) {
  cpSync(srcLocustsDir, destLocustsDir, { recursive: true });
}

export default defineConfig({
  base: '/locusts/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      wrapperClasses: 'article-body',
      headEnabled: true,
      transforms: {
        before(src) {
          return src.replace(/\]\(((?:[^()]+|\([^()]*\))+)\)/g, (match, href) => {
            if (href.includes(' ') && !href.startsWith('http://') && !href.startsWith('https://')) {
              return `](${encodeURIComponent(href)})`;
            }
            return match;
          });
        },
      },
      markdownItSetup(md) {
        md.use(anchor, {
          permalink: anchor.permalink.ariaHidden({
            symbol: '',
            class: 'heading-anchor',
            placement: 'after',
          }),
          slugify: (s) =>
            s
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim(),
        });

        md.use(footnote);

        md.renderer.rules.footnote_ref = function (tokens, idx) {
          const id = tokens[idx].meta.id;
          const caption = id + 1;
          return `<Citation :index="${id}" label="${caption}" />`;
        };

        md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
          const token = tokens[idx];
          const hrefIdx = token.attrIndex('href');
          if (hrefIdx >= 0) {
            const href = token.attrs[hrefIdx][1];

            const isUrl =
              href.startsWith('http://') ||
              href.startsWith('https://') ||
              href.startsWith('/') ||
              href.startsWith('#') ||
              href.startsWith('mailto:') ||
              href.startsWith('./') ||
              href.startsWith('../');

            if (!isUrl) {
              token.tag = 'Tooltip';
              token.attrSet('content', decodeURIComponent(href));
              token.attrs = token.attrs.filter((_, i) => i !== hrefIdx);
              for (let j = idx + 1; j < tokens.length; j++) {
                if (tokens[j].type === 'link_close') {
                  tokens[j].tag = 'Tooltip';
                  break;
                }
              }
              return self.renderToken(tokens, idx, options);
            }

            token.tag = 'LinkTooltip';
            token.attrSet('href', href);
            for (let j = idx + 1; j < tokens.length; j++) {
              if (tokens[j].type === 'link_close') {
                tokens[j].tag = 'LinkTooltip';
                break;
              }
            }
          }
          return self.renderToken(tokens, idx, options);
        };

        md.renderer.rules.image = function (tokens, idx) {
          const token = tokens[idx];
          const src = token.attrGet('src') || '';
          const alt = token.content || '';
          return `<LazyImage src="${src}" alt="${alt}" />`;
        };

        md.core.ruler.push('carousel_detect', function (state) {
          const tokens = state.tokens;
          let i = 0;

          while (i < tokens.length) {
            if (
              tokens[i].type === 'hr' &&
              i + 1 < tokens.length &&
              tokens[i + 1].type === 'bullet_list_open'
            ) {
              let listEnd = -1;
              let hrAfterList = -1;
              let images = [];
              let isImageList = true;

              for (let j = i + 1; j < tokens.length; j++) {
                if (tokens[j].type === 'bullet_list_close') {
                  listEnd = j;
                  if (j + 1 < tokens.length && tokens[j + 1].type === 'hr') {
                    hrAfterList = j + 1;
                  }
                  break;
                }

                if (tokens[j].type === 'inline' && tokens[j].children) {
                  const imgTokens = tokens[j].children.filter(
                    (c) => c.type === 'image'
                  );
                  if (imgTokens.length > 0) {
                    imgTokens.forEach((img) => {
                      images.push({
                        src: img.attrGet('src') || '',
                        caption: img.content || '',
                      });
                    });
                  } else {
                    isImageList = false;
                  }
                }
              }

              if (isImageList && images.length > 0 && hrAfterList >= 0) {
                const newToken = new state.Token('html_block', '', 0);
                const escapedJson = JSON.stringify(images).replace(/"/g, '&quot;');
                newToken.content = `<ImageCarousel :images="${escapedJson}" />\n`;
                tokens.splice(i, hrAfterList - i + 1, newToken);
                continue;
              }
            }
            i++;
          }
        });
      },
      markdownItOptions: {
        html: true,
        typographer: true,
        linkify: true,
      },
    }),
    Components({
      dirs: [resolve(__dirname, 'src/components')],
      extensions: ['vue'],
      include: [/\.vue$/, /\.md$/],
      dts: false,
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        plugins: [fluidTypographyPlugin],
        additionalData: `@import "${resolve(__dirname, 'src/styles/variables.less').replace(/\\/g, '/')}";\n`,
      },
    },
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
  },
});
