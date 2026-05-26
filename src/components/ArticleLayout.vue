<template>
  <article class="article-wrapper" :style="customStyles">
    <!-- Running print header -->
    <div class="print-running-header">
      <span class="running-title">{{ frontmatter.title }}</span>
      <span class="running-meta">
        <span class="running-author">{{ frontmatter.author }}</span>
        <span class="running-divider">·</span>
        <span class="running-date">{{ formattedDate }}</span>
      </span>
    </div>
    <!-- Large, faded background icon for print -->
    <img
      v-if="frontmatter.icon"
      :src="resolvedIcon"
      class="print-background-icon"
      alt=""
    />
    <!-- Mask to hide the watermark on the first page -->
    <div class="print-first-page-watermark-cover"></div>
    <!-- Mask to hide the running header on the first page -->
    <div class="print-first-page-header-cover"></div>
    <ArticleHeader
      :title="frontmatter.title"
      :subtitle="frontmatter.subtitle"
      :date="frontmatter.date"
      :author="frontmatter.author"
      :icon="frontmatter.icon"
      :icon_scale="frontmatter.icon_scale"
    />
    <div class="article-body-container">
      <nav
        v-if="printTocItems.length"
        class="print-toc"
        aria-label="Table of contents"
      >
        <h2 class="print-toc__title">Table of Contents</h2>
        <ul class="print-toc__list">
          <li
            v-for="item in printTocItems"
            :key="item.id"
            :class="`print-toc__item print-toc__item--h${item.level}`"
          >
            <a class="print-toc__link" :href="`#${item.id}`">{{ item.text }}</a>
          </li>
        </ul>
      </nav>
      <TableOfContents />
      <div class="article-content">
        <slot />
      </div>
    </div>
    <CitationList v-if="citations.length" :citations="citations" />
    <footer class="article-footer">
      <router-link to="/" class="back-link">← All Articles</router-link>
    </footer>
  </article>
</template>

<script setup>
import { provide, reactive, onMounted, onUnmounted, computed, ref, nextTick } from "vue";
import { collectArticleHeadings } from "@/composables/useArticleHeadings";
import {
  flushImageLoadsNow,
  scheduleImageLoadsAfterPaint,
} from "@/utils/imageLoadScheduler";
import { formatCitation, formatCitationPreview } from "@/sources";
import { useHead } from "@unhead/vue";
import { formatDate } from "@/utils/date";
import { resolveAssetUrl } from "@/utils/path";

const props = defineProps({
  frontmatter: {
    type: Object,
    default: () => ({}),
  },
});

const customStyles = computed(() => {
  const styles = {};
  if (props.frontmatter?.secondary) {
    styles["--article-secondary"] = props.frontmatter.secondary;
  }
  return styles;
});

const formattedDate = computed(() =>
  props.frontmatter?.date ? formatDate(props.frontmatter.date) : "",
);

const resolvedIcon = computed(() => resolveAssetUrl(props.frontmatter?.icon));

const citations = reactive([]);
let nextCitationIndex = 0;
const headingSelector = "h2, h3, h4, h5";
let contentEl = null;

const printTocItems = ref([]);

function buildPrintToc() {
  printTocItems.value = collectArticleHeadings();
}

function onBeforePrint() {
  flushImageLoadsNow();
  buildPrintToc();
  window.dispatchEvent(new Event("locusts:beforeprint-layout"));
}

function onHeadingClick(e) {
  if (e.target instanceof Element && e.target.closest("a")) return;
  const heading = e.target instanceof Element ? e.target.closest(headingSelector) : null;
  if (!(heading instanceof HTMLElement) || !heading.id) return;
  history.pushState(null, "", `#${heading.id}`);
  heading.scrollIntoView({ behavior: "smooth" });
}

provide("citations", citations);
provide("registerCitation", (citation) => {
  const index =
    typeof citation.index === "number" ? citation.index : nextCitationIndex++;

  const occurrence = citation.source
    ? citations.filter((c) => c.source === citation.source).length + 1
    : 1;

  const existing = citations.find((c) => c.index === index);
  if (!existing) {
    citations.push({
      ...citation,
      index,
      occurrence,
      content: citation.source
        ? formatCitation(citation.source, occurrence, citation.quoteIndex, citation.quote)
        : citation.content,
      preview: citation.source
        ? formatCitationPreview(citation.source, occurrence, citation.quoteIndex, citation.quote)
        : citation.preview || citation.content,
    });
    citations.sort((a, b) => a.index - b.index);
  }
  return { index, occurrence };
});

useHead({
  title: () => props.frontmatter?.title || "Locusts",
  meta: [
    {
      name: "description",
      content: () => props.frontmatter?.subtitle || "",
    },
    {
      name: "author",
      content: () => props.frontmatter?.author || "",
    },
  ],
});

onMounted(() => {
  scheduleImageLoadsAfterPaint();
  window.addEventListener("beforeprint", onBeforePrint);
  nextTick(() => {
    setTimeout(buildPrintToc, 100);
  });

  contentEl = document.querySelector(".article-content");
  if (contentEl) {
    contentEl.addEventListener("click", onHeadingClick);
  }

  const rawFootnotes = document.querySelector("section.footnotes");
  if (rawFootnotes) {
    rawFootnotes.style.display = "none";
    const items = rawFootnotes.querySelectorAll(".footnote-item");
    items.forEach((item, index) => {
      const backrefs = item.querySelectorAll(".footnote-backref");
      let text = item.innerHTML;
      backrefs.forEach((ref) => {
        text = text.replace(ref.outerHTML, "");
      });
      text = text.trim();
      if (text.startsWith("<p>") && text.endsWith("</p>")) {
        text = text.slice(3, -4);
      }
      citations.push({
        index,
        content: text,
        preview: text,
      });
      nextCitationIndex = Math.max(nextCitationIndex, index + 1);
    });
  }
});

onUnmounted(() => {
  window.removeEventListener("beforeprint", onBeforePrint);
  if (contentEl) {
    contentEl.removeEventListener("click", onHeadingClick);
    contentEl = null;
  }
});
</script>

<style lang="less" scoped>
.article-wrapper {
  max-width: var(--article-max-width);
  margin: 0 auto;
  padding: 0 1.5em 4em;
  position: relative;
  z-index: 1;
}

.article-body-container {
  position: relative;
}

.print-toc {
  display: none;
}

@media print {
  .print-toc {
    display: block;
    float: right;
    width: 35%;
    margin: 0 0 1.2em 1.2em;
    break-inside: avoid;
    page-break-inside: avoid;
    position: relative;
    z-index: 2;
  }

  .print-toc__title {
    font-size: 11pt;
    font-family: @font-display;
    font-weight: 800;
    margin: 0 0 0.4em;
    padding-bottom: 0.2em;
    border-bottom: 1px solid #222;
    color: #000;
  }

  .print-toc__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .print-toc__link {
    display: block;
    color: #111;
    text-decoration: none;
    font-family: @font-toc;
    line-height: 1.2;
    padding: 0.05em 0;
  }

  .print-toc__item--h2 .print-toc__link {
    font-size: 9.5pt;
  }

  .print-toc__item--h3 .print-toc__link {
    font-size: 8.5pt;
    font-style: italic;
    padding-left: 0.6em;
  }

  .print-toc__item--h4 .print-toc__link {
    font-size: 8pt;
    font-style: italic;
    padding-left: 1.1em;
    color: #444;
  }

  .print-toc__item--h5 .print-toc__link {
    font-size: 8pt;
    font-style: italic;
    padding-left: 1.6em;
    color: #555;
  }

  :deep(.toc) {
    display: none !important;
  }
}

.article-content {
  position: relative;
  text-align: justify;

  @media (max-width: 768px) {
    text-align: left;
  }
}

.article-footer {
  margin-top: 4em;
  padding-top: 2em;
  border-top: 1px solid @border;
}

.back-link {
  color: @text-secondary;
  font-size: font-size(0.9);
  transition: color @transition-fast;

  &:hover {
    color: @accent;
  }
}

.print-running-header {
  display: none;

  @media print {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0;
    left: 1.3in;
    right: 1.3in;
    height: 0.35in;
    border-bottom: 0.5px solid #ddd;
    font-size: 8.5pt;
    font-family: @font-display;
    color: #666;
    z-index: 9999;
  }
}

.running-title {
  font-weight: 700;
  color: #111;
}

.running-meta {
  font-weight: 400;
}

.running-author {
  color: var(--article-secondary, @accent);
  font-weight: 600;
}

.running-date {
  color: #666;
}

.running-divider {
  margin: 0 0.4em;
  opacity: 0.5;
}

.print-background-icon {
  display: none;

  @media print {
    display: block;
    position: fixed;
    bottom: 0.05in;
    right: 0.7in;
    width: 2.2in;
    height: auto;
    opacity: 0.055 !important;
    z-index: -1000;
    pointer-events: none;
  }
}

.print-first-page-watermark-cover {
  display: none;

  @media print {
    display: block;
    position: absolute;
    bottom: 0;
    right: 0.4in;
    width: 2.2in;
    height: 2.2in;
    background: #fff;
    z-index: -999;
  }
}

.print-first-page-header-cover {
  display: none;

  @media print {
    display: block;
    position: absolute;
    top: -0.8in;
    left: -1.3in;
    right: -1.3in;
    height: 0.8in;
    background: #fff;
    z-index: 10001;
  }
}
</style>
