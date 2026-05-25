<template>
  <span
    ref="triggerEl"
    class="time-marker"
    :data-date="dateText"
    :data-alt="alt"
    :data-id="timeId"
    :class="{ 'time-marker--highlighted': highlighted }"
    tabindex="0"
    @mouseenter="onHover"
    @mouseleave="onLeave"
    @focus="onHover"
    @blur="onLeave"
  >
    <slot />
  </span>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useTippy } from '@/composables/useTippy';

const props = defineProps({
  alt: { type: String, default: '' },
});

const registerTime = inject('registerTime', null);
const highlightedTimeId = inject('highlightedTimeId', null);
const setHighlightedId = inject('setHighlightedId', null);

const triggerEl = ref(null);
const timeId = `time-${Math.random().toString(36).slice(2, 9)}`;
const dateText = computed(() => triggerEl.value?.textContent?.trim() || '');
const highlighted = computed(() => highlightedTimeId?.value === timeId);

useTippy(triggerEl, computed(() => ({
  content: props.alt,
  maxWidth: 260,
})));

function onHover() {
  if (setHighlightedId) setHighlightedId(timeId);
}

function onLeave() {
  if (setHighlightedId) setHighlightedId(null);
}

onMounted(() => {
  if (triggerEl.value && registerTime) {
    registerTime({
      id: timeId,
      dateText: triggerEl.value.textContent.trim(),
      alt: props.alt,
      element: triggerEl.value,
    });
  }
});
</script>

<style lang="less" scoped>
.time-marker {
  font-weight: 600;
  transition: background @transition-fast, color @transition-fast;
  border-radius: @radius-sm;
  padding: 0 0.1em;
  cursor: default;
  position: relative;

  &:hover {
    background: @accent-faint;
  }

  &--highlighted {
    background: @accent-light;
    color: @accent-hover;
  }
}
</style>
