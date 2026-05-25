<template>
  <span ref="triggerRef" class="tooltip-trigger" :data-content="content" tabindex="0">
    <slot />
    <svg
      class="link__graphic link__graphic--stroke link__graphic--scribble"
      width="100%"
      height="100%"
      style="overflow: visible;"
      ref="svgRef"
    >
      <path v-for="(pathD, index) in paths" :key="index" :d="pathD" pathLength="1" />
    </svg>
  </span>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useTippy } from '@/composables/useTippy';
import { renderInlineMarkdown } from '@/utils/renderInlineMarkdown';

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
});

const triggerRef = ref(null);
const svgRef = ref(null);
const paths = ref([]);

let resizeObserver = null;

const renderedContent = computed(() => renderInlineMarkdown(props.content));

useTippy(triggerRef, computed(() => ({
  content: `<div class="tooltip-markdown">${renderedContent.value}</div>`,
})));

function generateSquiggle(startX, endX, baseY, amplitude = 2.5, step = 12) {
  let path = `M ${startX} ${baseY}`;
  let currentX = startX;
  let currentY = baseY;

  while (currentX < endX) {
    const nextX = Math.min(currentX + step, endX);
    const nextY = nextX === endX ? baseY : baseY + (Math.random() * 2 - 1) * (amplitude * 0.5);
    const cp1x = currentX + (nextX - currentX) * 0.33;
    const cp1y = currentY + (Math.random() * 2 - 1) * amplitude;
    const cp2x = currentX + (nextX - currentX) * 0.66;
    const cp2y = nextY + (Math.random() * 2 - 1) * amplitude;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nextX} ${nextY}`;
    currentX = nextX;
    currentY = nextY;
  }
  return path;
}

function updatePaths() {
  if (!triggerRef.value || !svgRef.value) return;
  const rects = triggerRef.value.getClientRects();
  const svgRect = svgRef.value.getBoundingClientRect();
  const newPaths = [];

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    const startX = rect.left - svgRect.left;
    const endX = rect.right - svgRect.left;
    const y = rect.bottom - svgRect.top - 1;
    newPaths.push(generateSquiggle(startX, endX, y));
  }
  paths.value = newPaths;
}

onMounted(() => {
  updatePaths();
  resizeObserver = new ResizeObserver(updatePaths);
  if (triggerRef.value) resizeObserver.observe(triggerRef.value);
  window.addEventListener('resize', updatePaths);
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  window.removeEventListener('resize', updatePaths);
});
</script>

<style lang="less" scoped>
.tooltip-trigger {
  position: relative;
  display: inline;
  border-bottom: 1.5px dotted color-mix(in srgb, var(--article-secondary) 60%, transparent);
  cursor: help;
  color: inherit;
  padding-bottom: 1px;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: transparent;
  }
}

.link__graphic {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  fill: none;
  stroke: var(--article-secondary);
  stroke-width: 2px;
  overflow: visible;
}

.link__graphic--stroke path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}

.tooltip-trigger:hover .link__graphic--stroke path {
  stroke-dashoffset: 0;
}

.link__graphic--scribble path {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.7, 0, 0.3, 1);
}

.tooltip-trigger:hover .link__graphic--scribble path {
  transition-timing-function: cubic-bezier(0.8, 1, 0.7, 1);
  transition-duration: 0.3s;
}

@media print {
  .tooltip-trigger {
    border-bottom: none !important;
    cursor: default !important;

    &::after {
      content: " (" attr(data-content) ")";
      color: var(--article-secondary, @accent) !important;
      font-size: 0.9em !important;
      opacity: 0.85 !important;
      font-weight: normal !important;
      font-style: normal !important;
    }
  }

  .link__graphic {
    display: none !important;
  }
}
</style>
