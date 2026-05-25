<template>
  <div class="carousel" role="region" aria-label="Image carousel">
    <div class="carousel__inner">
      <div
        class="carousel__viewport"
        ref="viewportEl"
        :style="{ height: height }"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <div
          class="carousel__track"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div
            v-for="(img, i) in images"
            :key="i"
            class="carousel__slide"
          >
            <LazyImage :src="img.src" :alt="img.caption" hide-caption />
          </div>
        </div>
      </div>

      <button
        v-if="images.length > 1"
        class="carousel__arrow carousel__arrow--prev"
        @click="prev"
        :disabled="currentIndex === 0"
        aria-label="Previous image"
      >
        ‹
      </button>

      <button
        v-if="images.length > 1"
        class="carousel__arrow carousel__arrow--next"
        @click="next"
        :disabled="currentIndex === images.length - 1"
        aria-label="Next image"
      >
        ›
      </button>
    </div>

    <div v-if="images.length > 1" class="carousel__indicators">
      <button
        v-for="(img, i) in images"
        :key="i"
        :class="['carousel__dot', { 'carousel__dot--active': i === currentIndex }]"
        @click="goTo(i)"
        :aria-label="`Go to image ${i + 1}`"
      />
    </div>

    <p v-if="currentCaption" class="carousel__caption">{{ currentCaption }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  height: {
    type: String,
    default: '40vh',
  },
});

const currentIndex = ref(0);
const viewportEl = ref(null);

const currentCaption = computed(() => props.images[currentIndex.value]?.caption || '');

function next() {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function goTo(index) {
  currentIndex.value = index;
}

let touchStartX = 0;
function onTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function onTouchEnd(e) {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) next();
    else prev();
  }
}
</script>

<style lang="less" scoped>
.carousel {
  margin: 2em auto;
  max-width: 600px;
}

.carousel__inner {
  position: relative;
  overflow: hidden;
}

.carousel__viewport {
  overflow: hidden;
  position: relative;
}

.carousel__track {
  display: flex;
  height: 100%;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel__slide {
  flex: 0 0 100%;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  :deep(.lazy-image) {
    margin: 0 auto;
    max-width: 100%;
    height: 100%; /* Force figure to take full height */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: transparent;
  }

  :deep(.lazy-image__container) {
    width: auto !important; /* Override 100% width from LazyImage */
    height: 100%;
    max-height: 100%;
    max-width: 100%;
    margin: 0 auto;
    border-radius: @radius;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  :deep(.lazy-image__img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.carousel__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(4px);
  color: @text-secondary;
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background @transition-fast, color @transition-fast, opacity @transition-fast;
  z-index: 10;
  line-height: 1;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.9);
    color: @text;
  }

  &:disabled {
    opacity: 0.25;
    cursor: default;
  }

  &--prev {
    left: 12px;
  }

  &--next {
    right: 12px;
  }
}

.carousel__indicators {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 0.8em;
}

.carousel__dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  border: none;
  background: @border;
  cursor: pointer;
  padding: 0;
  transition: background @transition-fast, width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &--active {
    background: @accent;
    width: 18px;
  }

  &:hover:not(&--active) {
    background: @text-muted;
  }
}

.carousel__caption {
  text-align: center;
  font-family: 'EB Garamond', serif;
  font-size: 0.9em;
  color: @text-secondary;
  font-style: italic;
  margin-top: 0.5em;
}
</style>
