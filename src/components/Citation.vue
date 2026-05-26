<template>
  <sup ref="triggerEl" class="citation">
    <a
      :href="`#fn-${displayIndexNumber}`"
      class="citation__link"
      @click.prevent="scrollToCitation"
      :id="`fnref-${displayIndexNumber}`"
    >
      [{{ displayLabel }}]
    </a>
  </sup>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useTippy } from "@/composables/useTippy";
import { formatCitation, formatCitationPreview } from "@/sources";

const props = defineProps({
  index: { type: Number, default: null },
  label: { type: [String, Number], default: "" },
  source: { type: String, default: "" },
  quoteIndex: { type: [Number, String], default: null },
  quote: { type: String, default: "" },
  content: { type: String, default: "" },
});

const triggerEl = ref(null);
const assignedIndex = ref(props.index);
const occurrence = ref(1);

const citations = inject("citations", []);
const registerCitation = inject("registerCitation", () => null);

const normalizedQuoteIndex = computed(() => {
  if (
    props.quoteIndex === null ||
    props.quoteIndex === undefined ||
    props.quoteIndex === ""
  ) {
    return null;
  }
  return Number(props.quoteIndex);
});

const displayIndexNumber = computed(
  () => assignedIndex.value ?? props.index ?? 0,
);
const displayLabel = computed(
  () => props.label || displayIndexNumber.value + 1,
);

const ownCitation = computed(() =>
  citations.find((c) => c.index === displayIndexNumber.value),
);

const fallbackContent = computed(() => {
  if (props.source) {
    return formatCitationPreview(
      props.source,
      occurrence.value,
      normalizedQuoteIndex.value,
      props.quote,
    );
  }
  return props.content;
});

const citationContent = computed(
  () =>
    ownCitation.value?.preview ||
    ownCitation.value?.content ||
    fallbackContent.value ||
    "",
);

useTippy(
  triggerEl,
  computed(() => ({
    content: citationContent.value,
    maxWidth: 420,
    placement: "top",
  })),
);

function scrollToCitation() {
  const el = document.getElementById(`fn-${displayIndexNumber.value}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("citation-list__item--highlight");
    setTimeout(
      () => el.classList.remove("citation-list__item--highlight"),
      2000,
    );
  }
}

onMounted(() => {
  if (!props.source && props.index !== null) return;

  const registered = registerCitation({
    index: props.index,
    source: props.source,
    content: props.source
      ? formatCitation(props.source, 1, normalizedQuoteIndex.value, props.quote)
      : props.content,
    preview: props.source
      ? formatCitationPreview(
          props.source,
          1,
          normalizedQuoteIndex.value,
          props.quote,
        )
      : props.content,
    quoteIndex: normalizedQuoteIndex.value,
    quote: props.quote,
  });

  if (registered) {
    assignedIndex.value = registered.index;
    occurrence.value = registered.occurrence || 1;
  }
});
</script>

<style lang="less" scoped>
.citation {
  position: relative;
  display: inline;
}

.citation__link {
  color: @accent;
  display: inline-block;
  height: 1.25ch;
  text-decoration: none;
  font-size: 0.85em;
  font-weight: 600;
  cursor: pointer;
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 100% 100%;
  background-repeat: no-repeat;
  background-size: 0% 1.5px;
  padding-bottom: 1px;
  transition:
    color @transition-fast,
    background-size 0.3s ease;

  &:hover {
    color: @accent-hover;
    background-position: 0% 100%;
    background-size: 100% 1.5px;
  }
}

@media print {
  .citation__link {
    font-size: 6pt !important;
    font-weight: 500;
    color: #333 !important;
    background: none !important;
  }
}
</style>
