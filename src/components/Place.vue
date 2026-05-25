<template>
  <span ref="triggerEl" class="place-trigger" tabindex="0">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useTippy } from '@/composables/useTippy';

const props = defineProps({
  lat: { type: [Number, String], required: true },
  lng: { type: [Number, String], required: true },
  zoom: { type: [Number, String], default: 8 },
  label: { type: String, default: 'Map' },
  mapTitle: { type: String, default: 'Map' },
});

const triggerEl = ref(null);

const mapSrc = computed(() => {
  const lat = encodeURIComponent(String(props.lat));
  const lng = encodeURIComponent(String(props.lng));
  const zoom = encodeURIComponent(String(props.zoom));
  return `https://www.openstreetmap.org/export/embed.html?bbox=${Number(props.lng) - 0.25}%2C${Number(props.lat) - 0.18}%2C${Number(props.lng) + 0.25}%2C${Number(props.lat) + 0.18}&layer=mapnik&marker=${lat}%2C${lng}&zoom=${zoom}`;
});

const tooltipContent = computed(() => `
  <div class="place-tooltip">
    <iframe
      title="${props.mapTitle.replace(/"/g, '&quot;')}"
      src="${mapSrc.value}"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
`);

useTippy(triggerEl, computed(() => ({
  content: tooltipContent.value,
  interactive: true,
  placement: 'top',
  maxWidth: 430,
  trigger: 'mouseenter focus click',
})));
</script>

<style lang="less" scoped>
.place-trigger {
  border-bottom: 1.5px dotted color-mix(in srgb, var(--article-secondary) 70%, transparent);
  cursor: help;
}
</style>
