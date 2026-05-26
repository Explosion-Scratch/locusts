<template>
  <figure class="lazy-image">
    <div class="lazy-image__container" :style="aspectStyle">
      <canvas
        v-if="blurhashData && !loaded"
        ref="canvasEl"
        class="lazy-image__placeholder"
        :width="placeholderW"
        :height="placeholderH"
      />
      <img
        v-if="shouldLoad"
        :src="resolvedSrc"
        :alt="resolvedAlt"
        :class="['lazy-image__img', { 'lazy-image__img--loaded': loaded }]"
        @load="onLoad"
        loading="eager"
        decoding="async"
      />
    </div>
    <figcaption v-if="resolvedAlt && !hideCaption" class="lazy-image__caption">
      {{ resolvedAlt }}
    </figcaption>
  </figure>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { decode } from 'blurhash';
import imageRegistry from '@/assets/images.json';
import { resolveAssetUrl } from '@/utils/path';
import { onImageLoadsAfterPaint } from '@/utils/imageLoadScheduler';

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  blurhash: { type: String, default: '' },
  hideCaption: { type: Boolean, default: false },
  immediate: { type: Boolean, default: false },
});

const resolvedSrc = computed(() => resolveAssetUrl(props.src));

const canvasEl = ref(null);
const loaded = ref(false);
const shouldLoad = ref(false);

const placeholderW = 32;
const placeholderH = 32;

const registryEntry = computed(() => {
  const slug = props.src.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
  return imageRegistry[slug] || null;
});

const blurhashData = computed(
  () => props.blurhash || registryEntry.value?.blurhash || ''
);

const resolvedAlt = computed(
  () => props.alt || registryEntry.value?.alt || ''
);

const imgWidth = computed(
  () => props.width || registryEntry.value?.width || 0
);

const imgHeight = computed(
  () => props.height || registryEntry.value?.height || 0
);

const aspectStyle = computed(() => {
  if (imgWidth.value && imgHeight.value) {
    return { aspectRatio: `${imgWidth.value} / ${imgHeight.value}` };
  }
  return {};
});

function renderBlurhash() {
  if (!blurhashData.value || !canvasEl.value) return;
  try {
    const pixels = decode(blurhashData.value, placeholderW, placeholderH);
    const ctx = canvasEl.value.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.createImageData(placeholderW, placeholderH);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  } catch {
  }
}

function onLoad() {
  loaded.value = true;
}

function enableLoad() {
  shouldLoad.value = true;
}

let stopPaintLoad = null;

onMounted(() => {
  nextTick(() => renderBlurhash());

  if (props.immediate) {
    enableLoad();
    return;
  }

  // Intended behavior: continue queuing deferred image loads after first paint.
  stopPaintLoad = onImageLoadsAfterPaint(enableLoad);
});

onUnmounted(() => {
  stopPaintLoad?.();
});

watch(
  () => props.immediate,
  (immediate) => {
    if (immediate) enableLoad();
  }
);

watch(() => blurhashData.value, () => {
  nextTick(() => renderBlurhash());
});
</script>

<style lang="less" scoped>
.lazy-image {
  margin: 1.8em 0;
}

.lazy-image__container {
  position: relative;
  overflow: hidden;
  background: @bg-subtle;
  border-radius: @radius-sm;
  width: 100%;
}

.lazy-image__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(12px);
  transform: scale(1.1);
  transition: opacity @transition-slow;
}

.lazy-image__img {
  display: block;
  width: 100%;
  height: auto;
  opacity: 0;
  transition: opacity @transition-slow;

  &--loaded {
    opacity: 1;
  }
}

.lazy-image__caption {
  font-family: 'EB Garamond', serif;
  font-size: 0.9em;
  color: @text-secondary;
  text-align: center;
  padding: 0.6em 0.5em;
  font-style: italic;
}

@media print {
  .lazy-image {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .lazy-image__img {
    opacity: 1;
  }
}
</style>
