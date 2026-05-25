<template>
  <section v-if="citations.length" class="citation-list" aria-label="Citations">
    <h2 class="citation-list__title">References</h2>
    <ol class="citation-list__items">
      <li
        v-for="c in sortedCitations"
        :key="c.index"
        :id="`fn-${c.index}`"
        class="citation-list__item"
      >
        <span class="citation-list__content" v-html="c.content" />
        <a
          :href="`#fnref-${c.index}`"
          class="citation-list__backref"
          @click.prevent="scrollBack(c.index)"
          aria-label="Back to reference"
        >↩</a>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  citations: {
    type: Array,
    default: () => [],
  },
});

const sortedCitations = computed(() =>
  [...props.citations].sort((a, b) => a.index - b.index)
);

function scrollBack(index) {
  const el = document.getElementById(`fnref-${index}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
</script>

<style lang="less" scoped>
.citation-list {
  margin-top: 4em;
  padding-top: 0.5em;
  border-top: 1px solid @border;
}

.citation-list__title {
  font-size: font-size(1.1);
  margin-bottom: 1em;
  color: @text-secondary;
  font-weight: 600;
}

.citation-list__items {
  padding-left: 1.4em;
  font-size: font-size(0.74);
  line-height: 1.35;
  color: @text-secondary;
}

.citation-list__item {
  margin-bottom: 0.8em;
  padding: 0.4em 0;
  transition: background @transition-fast;
  border-radius: @radius-sm;

  &:target,
  &--highlight {
    background: @accent-light;
    padding-left: 0.5em;
    margin-left: -0.5em;
  }
}

.citation-list__backref {
  color: @text-muted;
  text-decoration: none;
  margin-left: 0.4em;
  font-size: 0.9em;
  transition: color @transition-fast;

  &:hover {
    color: @accent;
  }
}

.citation-list__content {
  :deep(.citation-source-link) {
    color: @accent;
    text-decoration: none;
    background-image: linear-gradient(currentColor, currentColor);
    background-position: 100% 100%;
    background-repeat: no-repeat;
    background-size: 0% 1.5px;
    padding-bottom: 1px;
    transition: background-size 0.3s ease, color @transition-fast;

    &:hover,
    &:focus {
      color: @accent-hover;
      background-position: 0% 100%;
      background-size: 100% 1.5px;
    }
  }

  :deep(.citation-list__quote) {
    display: block;
    margin: 0.3em 0 0.2em;
    padding: 0.25em 0 0 0.5em;
    border-top: 1px solid @border-light;
    border-left: 2px solid @accent-light;
    color: @text-secondary;
    font-style: italic;
    font-size: 0.95em;
    line-height: 1.35;
  }
}
</style>
