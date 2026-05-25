<template>
  <a
    ref="triggerEl"
    :href="href"
    class="link-tooltip"
    target="_blank"
    rel="noopener"
  >
    <slot />
  </a>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useTippy } from '@/composables/useTippy';

const props = defineProps({
  href: {
    type: String,
    default: '#',
  },
});

const triggerEl = ref(null);

const displayHref = computed(() => {
  try {
    const url = new URL(props.href);
    return url.hostname + (url.pathname !== '/' ? url.pathname : '');
  } catch {
    return props.href;
  }
});

useTippy(triggerEl, computed(() => ({
  content: `<code class="link-destination-code">${displayHref.value}</code>`,
  maxWidth: 320,
  interactive: true,
})));
</script>

<style lang="less" scoped>
.link-tooltip {
  color: @accent;
  text-decoration: none;
  position: relative;
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 100% 100%;
  background-repeat: no-repeat;
  background-size: 0% 2px;
  transition: background-size 0.3s ease, color @transition-fast;
  padding-bottom: 1px;

  &:hover,
  &:focus {
    background-position: 0% 100%;
    background-size: 100% 2px;
    color: @accent-hover;
  }
}
</style>
