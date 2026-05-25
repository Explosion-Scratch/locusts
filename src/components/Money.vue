<template>
  <span ref="triggerEl" class="money-value" tabindex="0">
    <slot v-if="!showResultOnly" />
    <template v-else>{{ formattedResult }}</template>
  </span>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useTippy } from '@/composables/useTippy';
import { CPI_SOURCE_LABEL, LATEST_CPI_YEAR, convertDollars } from '@/data/cpi';

const props = defineProps({
  from: { type: [Number, String], default: null },
  year: { type: [Number, String], required: true },
  toYear: { type: [Number, String], default: LATEST_CPI_YEAR },
  result: { type: [Boolean, String], default: false },
  mode: { type: String, default: '' },
  currency: { type: String, default: 'USD' },
  precision: { type: [Number, String], default: 0 },
});

const triggerEl = ref(null);

const amount = computed(() => {
  if (props.from !== null && props.from !== undefined && props.from !== '') {
    return Number(String(props.from).replace(/[$,]/g, ''));
  }
  if (typeof props.result === 'string' && props.result && props.result !== 'true') {
    return Number(String(props.result).replace(/[$,]/g, ''));
  }
  return NaN;
});

const fromYear = computed(() => Number(props.year));
const targetYear = computed(() => Number(props.toYear || LATEST_CPI_YEAR));
const converted = computed(() => convertDollars(amount.value, fromYear.value, targetYear.value));
const showResultOnly = computed(() => props.mode === 'result' || props.result === true);

const formatter = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.currency,
    maximumFractionDigits: Number(props.precision),
    minimumFractionDigits: Number(props.precision),
  }),
);

function formatMoney(value) {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} Billion`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')} Million`;
  }
  return formatter.value.format(value);
}

const formattedResult = computed(() => {
  if (!converted.value) return 'unavailable';
  return formatMoney(converted.value.amount);
});

const formattedOriginal = computed(() => {
  if (!converted.value) return 'unavailable';
  return formatMoney(amount.value);
});

const tooltipContent = computed(() => {
  if (!converted.value) {
    return `<strong>Inflation conversion unavailable.</strong><br>Missing CPI for ${fromYear.value} or ${targetYear.value}.`;
  }

  const { fromCpi, toCpi } = converted.value;
  const multiplier = toCpi / fromCpi;

  if (showResultOnly.value) {
    return `
      <div class="money-tooltip">
        <strong>= ${formattedOriginal.value} in ${fromYear.value} dollars</strong>
        <span class="money-tooltip__meta">${targetYear.value} &rarr; &divide;${multiplier.toFixed(1).replace(/\.0$/, '')} &rarr; ${fromYear.value}</span>
      </div>
    `;
  }

  return `
    <div class="money-tooltip">
      <strong>= ${formattedResult.value}</strong>
      <span class="money-tooltip__meta">${fromYear.value} &rarr; &times;${multiplier.toFixed(1).replace(/\.0$/, '')} &rarr; ${targetYear.value}</span>
    </div>
  `;
});

useTippy(triggerEl, computed(() => ({ content: tooltipContent.value, maxWidth: 390 })));
</script>

<style lang="less" scoped>
.money-value {
  color: #225c3b;
  text-shadow: 0 1px 2px rgba(46, 125, 50, 0.15);
  cursor: help;
  font-variant-numeric: tabular-nums;
  transition: color @transition-fast, text-shadow @transition-fast;

  &:hover {
    color: #1b4d31;
    text-shadow: 0 1.5px 3px rgba(27, 77, 49, 0.25);
  }
}
</style>
