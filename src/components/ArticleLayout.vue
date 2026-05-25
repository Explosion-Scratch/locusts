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
import { provide, reactive, onMounted, computed } from "vue";
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
  const content = document.querySelector(".article-content");
  if (content) {
    const headings = content.querySelectorAll("h2, h3, h4, h5, h6");
    headings.forEach((heading) => {
      heading.addEventListener("click", (e) => {
        if (e.target.tagName === "A") return;
        if (heading.id) {
          history.pushState(null, "", `#${heading.id}`);
          heading.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
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
    left: 1.8in;
    right: 1.8in;
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
    left: -1.8in;
    right: -1.8in;
    height: 0.8in;
    background: #fff;
    z-index: 10000;
  }
}
</style>
