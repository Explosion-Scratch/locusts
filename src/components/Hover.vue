<template>
  <span class="hover-trigger" ref="triggerEl" @click="onClick">
    <span v-if="content" class="hover-trigger__text">
      <slot name="trigger"><slot /></slot>
    </span>
    <span v-else v-html="renderedText" class="hover-trigger__text" />

    <span class="hover-card-print" ref="printCardEl">
      <template v-if="content">
        <span v-html="renderedContent" />
      </template>
      <template v-else>
        <slot />
      </template>
    </span>

    <Teleport to="body">
      <Transition name="hover-card">
        <div v-if="showCard" class="hover-card" :style="cardStyle" ref="cardEl">
          <div class="hover-card__content">
            <template v-if="content">
              <span v-html="renderedContent" />
            </template>
            <template v-else>
              <slot />
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { renderInlineMarkdown } from "@/utils/renderInlineMarkdown";

const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  },
});

const triggerEl = ref(null);
const printCardEl = ref(null);
const showCard = ref(false);
const isMobile = ref(false);
const cardPosition = ref({ top: 0, left: 0 });

let scrollHandler;

const renderedText = computed(() => renderInlineMarkdown(props.text));
const renderedContent = computed(() => renderInlineMarkdown(props.content));

const cardStyle = computed(() => {
  if (isMobile.value) return {};
  return {
    top: `${cardPosition.value.top}px`,
    left: `${cardPosition.value.left}px`,
  };
});

function checkMobile() {
  isMobile.value = window.innerWidth < 1100;
}

function positionCard() {
  if (!triggerEl.value || isMobile.value) return;

  const rect = triggerEl.value.getBoundingClientRect();
  const articleEl = document.querySelector(".article-content");
  if (!articleEl) return;

  const articleRect = articleEl.getBoundingClientRect();
  cardPosition.value = {
    top: rect.top + window.scrollY - 4,
    left: articleRect.right + 25,
  };
}

function checkVisibility() {
  if (isMobile.value || !triggerEl.value) return;

  const pEl = triggerEl.value.closest("p, li, blockquote") || triggerEl.value;
  const rect = pEl.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  const elementCenter = rect.top + rect.height / 2;
  const distance = Math.abs(viewportCenter - elementCenter);
  const threshold = window.innerHeight * 0.35;

  if (distance < threshold) {
    if (!showCard.value) {
      positionCard();
      showCard.value = true;
    } else {
      positionCard();
    }
  } else {
    showCard.value = false;
  }
}

function handleResize() {
  checkMobile();
  positionCard();
}

function onClick(e) {
  if (!isMobile.value) return;
  e.stopPropagation();
  showCard.value = !showCard.value;
}

function handleClickOutside(e) {
  if (isMobile.value && showCard.value) {
    if (triggerEl.value && triggerEl.value.contains(e.target)) return;
    showCard.value = false;
  }
}

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", handleResize);
  document.addEventListener("click", handleClickOutside);

  scrollHandler = () => checkVisibility();
  window.addEventListener("scroll", scrollHandler, { passive: true });
  checkVisibility();

  nextTick(() => {
    if (printCardEl.value) {
      const parentBlock = printCardEl.value.closest(
        "p, ul, ol, blockquote, h1, h2, h3, h4, h5, h6",
      );
      if (parentBlock && parentBlock.parentNode) {
        parentBlock.parentNode.insertBefore(printCardEl.value, parentBlock);
      }
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  document.removeEventListener("click", handleClickOutside);
  if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
});
</script>

<style lang="less" scoped>
.hover-trigger {
  display: inline;
  position: relative;
}

.hover-trigger__text {
  display: inline;
  cursor: default;

  @media (max-width: 1100px) {
    cursor: pointer;
    background-image:
      linear-gradient(rgba(45, 125, 154, 0.08), rgba(45, 125, 154, 0.08)),
      linear-gradient(rgba(45, 125, 154, 0.35), rgba(45, 125, 154, 0.35));
    background-position:
      0 100%,
      0 100%;
    background-repeat: repeat-x, no-repeat;
    background-size:
      100% 3px,
      0% 1.5px;
    padding-bottom: 2px;
    transition:
      background-size 0.35s ease,
      background-color @transition;

    &:hover {
      background-size:
        100% 3px,
        100% 1.5px;
      background-color: rgba(45, 125, 154, 0.04);
    }
  }
}

.hover-card-print {
  display: none;
}

@media print {
  .hover-card-print {
    display: block;
    width: 100%;
    margin: 1.5em 0;
    padding: 0.8em 1em;
    background: transparent;
    border: 1px solid @border;
    border-left: 3px solid @accent;
    border-radius: @radius-sm;
    font-size: 0.85em;
    line-height: 1.5;
    color: #333;
    break-inside: avoid;
    page-break-inside: avoid;
    font-weight: 400;
  }
}
</style>

<style lang="less">
.hover-card {
  position: absolute;
  right: 20px;
  background: @bg-elevated;
  border: 1px solid @border-light;
  border-left: 2px solid @accent;
  border-radius: @radius;
  padding: 0.5em 0.6em;
  box-shadow: 0 8px 24px rgba(35, 28, 18, 0.08);
  z-index: 1000;
  font-size: 0.76em;
  line-height: 1.42;

  @media (max-width: 1100px) {
    position: fixed !important;
    bottom: 16px !important;
    left: 16px !important;
    right: 16px !important;
    width: auto !important;
    top: auto !important;
    font-size: 0.9em !important;
    padding: 0.8em 1em;
  }

  @media print {
    display: none !important;
  }
}

.hover-card__content {
  color: @text;

  a {
    color: @accent;
  }

  p {
    margin-bottom: 0.4em;
    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    font-weight: 700;
  }

  em {
    font-style: italic;
  }
}

.hover-card-enter-active,
.hover-card-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.hover-card-enter-from {
  opacity: 0;
  transform: translateX(-6px);
}

.hover-card-leave-to {
  opacity: 0;
  transform: translateX(6px);
}

@media (max-width: 1100px) {
  .hover-card-enter-from {
    transform: translateY(12px) !important;
  }

  .hover-card-leave-to {
    transform: translateY(12px) !important;
  }
}
</style>
