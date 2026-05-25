<template>
  <header class="article-header">
    <img
      v-if="icon"
      :src="resolvedIcon"
      class="article-icon"
      alt=""
      :style="{ '--icon_scale': icon_scale }"
    />
    <h1
      class="article-title"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <span
        class="title-text"
        :class="{
          'title-text--hover': titleHover,
          'title-text--animating': isAnimating,
        }"
      >
        <template v-for="(word, wIdx) in titleWords" :key="wIdx">
          <span class="title-word">
            <span
              v-for="charObj in word.chars"
              :key="charObj.idx"
              class="title-char"
              :style="{ '--char-index': charObj.idx }"
              >{{ charObj.char }}</span
            >
          </span>
          <span v-if="wIdx < titleWords.length - 1" class="title-space">{{
            " "
          }}</span>
        </template>
      </span>
    </h1>
    <p v-if="subtitle" class="article-subtitle">{{ subtitle }}</p>
    <div class="article-meta">
      <router-link to="/" class="author-link">{{ author }}</router-link>
      <span class="meta-separator">·</span>
      <span
        class="date-display"
        @mouseenter="showRelative = true"
        @mouseleave="showRelative = false"
      >
        <span class="date-text">{{ formattedDate }}</span>
        <Transition name="date-tooltip">
          <span v-if="showRelative" class="date-tooltip">{{ relative }}</span>
        </Transition>
      </span>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { formatDate, relativeTime } from "@/utils/date";
import { resolveAssetUrl } from "@/utils/path";

const props = defineProps({
  title: String,
  subtitle: String,
  date: String,
  author: String,
  icon: String,
  icon_scale: Number,
});

const resolvedIcon = computed(() => resolveAssetUrl(props.icon));

const titleHover = ref(false);
const isAnimating = ref(false);
const showRelative = ref(false);
const formattedDate = computed(() =>
  props.date ? formatDate(props.date) : "",
);
const relative = computed(() => (props.date ? relativeTime(props.date) : ""));
const titleChars = computed(() => {
  if (!props.title) return [];
  return Array.from(props.title);
});

const titleWords = computed(() => {
  if (!props.title) return [];
  const words = props.title.split(" ");
  let charCount = 0;
  return words.map((word, wIdx) => {
    const chars = Array.from(word).map((char) => {
      const idx = charCount;
      charCount++;
      return { char, idx };
    });
    if (wIdx < words.length - 1) {
      charCount++;
    }
    return {
      chars,
    };
  });
});

let animationTimeout = null;

function onMouseEnter() {
  titleHover.value = true;
  if (!isAnimating.value) {
    isAnimating.value = true;
    const duration = 400 + titleChars.value.length * 15;
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
    animationTimeout = setTimeout(() => {
      isAnimating.value = false;
    }, duration);
  }
}

function onMouseLeave() {
  titleHover.value = false;
}

onUnmounted(() => {
  if (animationTimeout) {
    clearTimeout(animationTimeout);
  }
});
</script>

<style lang="less" scoped>
.article-icon {
  display: block;
  margin: 0 auto 1.5rem;
  width: calc(12.5rem * var(--icon_scale, 1));
  height: auto;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))
    drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))
    drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
  transition:
    transform 0.3s ease,
    filter 0.3s ease;
  object-fit: contain;

  &:hover {
    transform: translateY(-2px);
    filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.12))
      drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06));
  }
  @media print {
    filter: none;
  }
}

.article-header {
  text-align: center;
  padding: 5.5em 0 1.2em;
  margin-bottom: 0.8em;

  @media (min-width: 900px) {
    margin-left: -3em;
    margin-right: -3em;
  }
  @media (min-width: 1100px) {
    margin-left: -5em;
    margin-right: -5em;
  }
  @media print {
    padding-top: 0 !important;
  }
}

.article-title {
  position: relative;
  display: block;
  margin: 0 0 0.4em;
  line-height: 1.15;
  cursor: default;
  letter-spacing: -0.01em !important;
  transition: none !important;

  &:hover {
    letter-spacing: -0.01em !important;
    transition: none !important;
  }
}

.title-text {
  font-family: @font-display;
  font-weight: 800;
  font-optical-sizing: auto;
  position: relative;
  display: inline;
  background-image: linear-gradient(to right, @accent-light, @accent-light);
  background-repeat: no-repeat;
  background-position: 0 88%;
  background-size: 100% 0.25em;
  transition:
    text-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
    background-size 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.3s ease;
  text-shadow: 0 0 0 transparent;
  padding: 0 0.05em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;

  &--hover {
    text-shadow:
      2px 3px 0 rgba(45, 125, 154, 0.07),
      -1px -1px 0 rgba(45, 125, 154, 0.03);
    background-size: 100% 0.35em;
  }
}

.title-word {
  display: inline-block;
  white-space: nowrap;
}

.title-char {
  display: inline-block;
  transition: transform 0.3s ease;
}

.title-text--animating .title-char {
  animation: title-ripple 0.4s ease-in-out;
  animation-delay: calc(var(--char-index) * 0.015s);
}

@keyframes title-ripple {
  0%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-0.25em);
  }
  60% {
    transform: translateY(0.1em);
  }
}

.article-subtitle {
  font-family: @font-display;
  font-weight: 400;
  font-style: italic;
  font-size: font-size(1.08);
  color: @text-secondary;
  margin: 0.3em auto 1.5em;
  max-width: 88%;
  line-height: 1.5;
  font-optical-sizing: auto;
}

.article-meta {
  font-size: font-size(0.82);
  color: @text-muted;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
}

.author-link {
  color: var(--article-secondary);
  font-weight: 400;
  font-size: 1.1em;
  transition: color @transition-fast;
  background-image: none !important;

  &:hover {
    color: color-mix(in srgb, var(--article-secondary) 80%, black);
    background-image: none !important;
  }
}

.meta-separator {
  opacity: 0.4;
}

.date-display {
  position: relative;
  cursor: default;
  font-weight: 400;
  font-style: normal;
}

.date-text {
  border-bottom: 1px dotted @border;
}

.date-tooltip {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: @bg-elevated;
  color: @text;
  border: 1px solid @border;
  font-size: 0.85em;
  padding: 0.3em 0.7em;
  border-radius: @radius;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &::before {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-bottom-color: @border;
  }
}

.date-tooltip-enter-active,
.date-tooltip-leave-active {
  transition:
    opacity @transition-fast,
    transform @transition-fast;
}

.date-tooltip-enter-from,
.date-tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(3px);
}

@media print {
  .article-icon {
    margin-bottom: 0.8rem !important;
  }

  .article-header {
    padding: 0 0 0.8em !important;
    margin-bottom: 0.5em !important;
  }

  .article-title {
    font-size: 24pt !important;
  }

  .article-subtitle {
    font-size: 11pt !important;
    margin: 0.2em auto 0.8em !important;
    color: #444 !important;
  }

  .article-meta {
    font-size: 9pt !important;
  }

  .author-link {
    color: var(--article-secondary, @accent) !important;
    font-weight: 600 !important;
  }

  .date-text {
    color: #444 !important;
    font-weight: 500 !important;
    border-bottom: none !important;
  }
}
</style>
