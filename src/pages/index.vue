<template>
  <div class="index-page">
    <header class="index-header">
      <h1 class="index-title">Locusts</h1>
      <p class="index-subtitle">A collection of writings</p>
    </header>

    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search articles…"
        aria-label="Search articles"
      />
      <span class="search-icon">⌕</span>
    </div>

    <main class="article-list">
      <article
        v-for="article in filteredArticles"
        :key="article.slug"
        class="article-card"
        @mouseenter="hoveredSlug = article.slug"
        @mouseleave="hoveredSlug = null"
      >
        <router-link :to="`/${article.slug}`" class="article-card__link">
          <h2 class="article-card__title">{{ article.title }}</h2>
          <div class="article-card__meta">
            <span class="article-card__author">{{ article.author }}</span>
            <span v-if="article.date" class="article-card__date">{{ formatDateShort(article.date) }}</span>
          </div>
          <p v-if="article.subtitle" class="article-card__subtitle">
            {{ article.subtitle }}
          </p>
        </router-link>
      </article>

      <p v-if="filteredArticles.length === 0" class="no-results">
        No articles found matching "{{ searchQuery }}"
      </p>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useHead } from '@unhead/vue';
import Fuse from 'fuse.js';
import { getArticleList } from '@/routes';

useHead({ title: 'Locusts' });

const articles = ref([]);
const searchQuery = ref('');
const hoveredSlug = ref(null);

onMounted(() => {
  articles.value = getArticleList();
});

const fuse = computed(() =>
  new Fuse(articles.value, {
    keys: ['title', 'subtitle', 'author'],
    threshold: 0.4,
    ignoreLocation: true,
  })
);

const filteredArticles = computed(() => {
  if (!searchQuery.value.trim()) {
    return articles.value;
  }
  return fuse.value.search(searchQuery.value).map((r) => r.item);
});

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>

<style lang="less" scoped>
.index-page {
  max-width: 620px;
  margin: 0 auto;
  padding: 0 1.5em 4em;
}

.index-header {
  text-align: center;
  padding: 4em 0 2em;
}

.index-title {
  font-family: @font-serif;
  font-size: font-size(2.8);
  font-weight: 600;
  margin-bottom: 0.2em;
  letter-spacing: -0.02em;
}

.index-subtitle {
  font-family: 'New Computer Modern Book', @font-serif;
  font-weight: 300;
  color: @text-secondary;
  font-size: font-size(1.1);
}

.search-container {
  position: relative;
  margin-bottom: 3em;
}

.search-input {
  width: 100%;
  font-family: @font-serif;
  font-size: font-size(0.95);
  padding: 0.7em 1em 0.7em 2.5em;
  border: 1px solid @border;
  border-radius: @radius;
  background: @bg-elevated;
  color: @text;
  outline: none;
  transition: border-color @transition-fast, box-shadow @transition-fast;

  &::placeholder {
    color: @text-muted;
  }

  &:focus {
    border-color: @accent;
    box-shadow: 0 0 0 3px @accent-light;
  }
}

.search-icon {
  position: absolute;
  left: 0.8em;
  top: 50%;
  transform: translateY(-50%);
  color: @text-muted;
  font-size: 1.1em;
  pointer-events: none;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.article-card {
  border-bottom: 1px solid @border-light;

  &:first-child {
    border-top: 1px solid @border-light;
  }
}

.article-card__link {
  display: block;
  padding: 1.5em 0;
  text-decoration: none;
  color: inherit;
  transition: background @transition-fast;

  &:hover {
    .article-card__title {
      color: @accent;
    }
  }
}

.article-card__title {
  font-family: @font-serif;
  font-size: font-size(1.3);
  font-weight: 600;
  margin-bottom: 0.3em;
  transition: color @transition-fast;
  line-height: 1.3;
}

.article-card__meta {
  font-size: font-size(0.82);
  color: @text-muted;
  margin-bottom: 0.4em;
  display: flex;
  gap: 0.8em;
}

.article-card__author {
  color: @accent;
  font-weight: 600;
}

.article-card__subtitle {
  color: @text-secondary;
  font-size: font-size(0.92);
  line-height: 1.45;
  margin: 0;
}

.no-results {
  text-align: center;
  color: @text-muted;
  font-style: italic;
  padding: 3em 0;
}
</style>
