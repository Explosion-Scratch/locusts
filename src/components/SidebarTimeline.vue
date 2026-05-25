<template>
  <div class="sidebar-timeline" ref="containerEl">
    <div class="sidebar-timeline__line" v-if="timeEvents.length >= 2" :style="lineStyle">
      <div
        v-for="event in positionedEvents"
        :key="event.id"
        class="sidebar-timeline__dot"
        :style="{ top: event.position + '%' }"
        @mouseenter="onDotHover(event)"
        @mouseleave="onDotLeave(event)"
        :class="{ 'sidebar-timeline__dot--active': highlightedId === event.id }"
      >
        <span class="sidebar-timeline__label">
          <span class="sidebar-timeline__date">{{ event.dateText }}</span>
          <span v-if="event.alt" class="sidebar-timeline__alt">{{ event.alt }}</span>
        </span>
      </div>
    </div>
    <div class="sidebar-timeline__content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, provide, computed, onMounted, nextTick, watch } from 'vue';

const containerEl = ref(null);
const timeEvents = ref([]);
const highlightedId = ref(null);

provide('highlightedTimeId', highlightedId);

provide('registerTime', (event) => {
  const exists = timeEvents.value.find((e) => e.id === event.id);
  if (!exists) {
    timeEvents.value.push(event);
  }
});

provide('setHighlightedId', (id) => {
  highlightedId.value = id;
});

watch(highlightedId, (newId) => {
  clearSentenceHighlights();
  if (newId) {
    const event = timeEvents.value.find((e) => e.id === newId);
    if (event) {
      highlightSentence(event);
    }
  }
});

function parseYear(text) {
  const match = text.match(/-?\d{3,4}/);
  return match ? parseInt(match[0]) : null;
}

const sortedEvents = computed(() => {
  return [...timeEvents.value]
    .map((e) => ({ ...e, year: parseYear(e.dateText) }))
    .filter((e) => e.year !== null)
    .sort((a, b) => a.year - b.year);
});

const positionedEvents = computed(() => {
  const events = sortedEvents.value;
  if (events.length < 2) return events.map((e) => ({ ...e, position: 50 }));

  const minYear = events[0].year;
  const maxYear = events[events.length - 1].year;
  const range = maxYear - minYear || 1;

  return events.map((e) => ({
    ...e,
    position: ((e.year - minYear) / range) * 80 + 10,
  }));
});

const lineStyle = computed(() => {
  if (positionedEvents.value.length < 2) return {};
  const first = positionedEvents.value[0].position;
  const last = positionedEvents.value[positionedEvents.value.length - 1].position;
  return {
    top: `${first}%`,
    height: `${last - first}%`,
  };
});

function onDotHover(event) {
  highlightedId.value = event.id;
}

function onDotLeave(event) {
  highlightedId.value = null;
}

function highlightSentence(event) {
  clearSentenceHighlights();

  if (!event.element) return;

  const parent = event.element.closest('p') || event.element.parentElement;
  if (!parent) return;

  const text = parent.textContent;
  const timeText = event.element.textContent.trim();
  const timeIndex = text.indexOf(timeText);
  if (timeIndex < 0) return;

  let sentenceStart = timeIndex;
  for (let i = timeIndex - 1; i >= 0; i--) {
    if (/[.!?]/.test(text[i])) {
      sentenceStart = i + 1;
      break;
    }
    if (i === 0) sentenceStart = 0;
  }

  let sentenceEnd = text.length;
  for (let i = timeIndex; i < text.length; i++) {
    if (/[.!?]/.test(text[i])) {
      sentenceEnd = i + 1;
      break;
    }
  }

  const range = document.createRange();
  const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
  let currentOffset = 0;
  let startNode = null, startOffset = 0, endNode = null, endOffset = 0;
  const ranges = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const nodeLen = node.textContent.length;

    if (!startNode && currentOffset + nodeLen > sentenceStart) {
      startNode = node;
      startOffset = sentenceStart - currentOffset;
    }

    if (!endNode && currentOffset + nodeLen >= sentenceEnd) {
      endNode = node;
      endOffset = sentenceEnd - currentOffset;
    }

    const overlapStart = Math.max(sentenceStart, currentOffset);
    const overlapEnd = Math.min(sentenceEnd, currentOffset + nodeLen);

    if (overlapStart < overlapEnd) {
      const isTooltip = node.parentElement && node.parentElement.closest('.tippy-box, .tooltip-content, .tooltip, .date-tooltip');
      if (!isTooltip) {
        const r = document.createRange();
        r.setStart(node, overlapStart - currentOffset);
        r.setEnd(node, overlapEnd - currentOffset);
        ranges.push(r);
      }
    }

    currentOffset += nodeLen;
  }

  if (startNode && endNode) {
    try {
      range.setStart(startNode, Math.max(0, startOffset));
      range.setEnd(endNode, Math.min(endNode.textContent.length, endOffset));

      if (typeof CSS !== 'undefined' && CSS.highlights) {
        const highlight = new Highlight(...ranges);
        CSS.highlights.set('timeline-sentence', highlight);
      } else {
        const highlight = document.createElement('span');
        highlight.className = 'timeline-sentence-highlight';
        range.surroundContents(highlight);
      }
    } catch {
      const els = parent.querySelectorAll('.time-marker');
      els.forEach((el) => {
        if (el.dataset.id === event.id) {
          const p = el.closest('p');
          if (p) p.classList.add('timeline-paragraph-highlight');
        }
      });
    }
  }
}

function clearSentenceHighlights() {
  if (typeof CSS !== 'undefined' && CSS.highlights) {
    CSS.highlights.delete('timeline-sentence');
  }
  document.querySelectorAll('.timeline-sentence-highlight').forEach((el) => {
    if (el.parentNode) {
      const parent = el.parentNode;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
      parent.normalize();
    }
  });
  document.querySelectorAll('.timeline-paragraph-highlight').forEach((el) => {
    el.classList.remove('timeline-paragraph-highlight');
  });
}
</script>

<style lang="less" scoped>
.sidebar-timeline {
  position: relative;
  margin: 2em 0;
  min-height: 120px;
}

.sidebar-timeline__line {
  position: absolute;
  left: -40px;
  width: 2px;
  background: @border;
  border-radius: 1px;

  @media (max-width: 900px) {
    display: none;
  }
}

.sidebar-timeline__dot {
  position: absolute;
  left: -4px;
  width: 10px;
  height: 10px;
  background: @bg;
  border: 2px solid @text-muted;
  border-radius: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  transition: border-color @transition-fast, background @transition-fast, transform @transition-fast;
  z-index: 2;

  &:hover,
  &--active {
    border-color: @accent;
    background: @accent;
    transform: translateY(-50%) scale(1.3);
  }
}

.sidebar-timeline__label {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 0.75em;
  opacity: 0;
  pointer-events: none;
  transition: opacity @transition-fast;
  background: @bg-elevated;
  border: 1px solid @border;
  padding: 0.25em 0.5em;
  border-radius: @radius;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;

  .sidebar-timeline__dot:hover & {
    opacity: 1;
    pointer-events: auto;
  }
}

.sidebar-timeline__date {
  font-weight: 600;
  color: @accent;
}

.sidebar-timeline__alt {
  display: block;
  color: @text-secondary;
  font-weight: 400;
  margin-top: 0.1em;
  font-size: 0.92em;
}

.sidebar-timeline__content {
  position: relative;
}
</style>

<style lang="less">
::highlight(timeline-sentence) {
  background-color: @accent-light;
}

.timeline-sentence-highlight {
  background: @accent-light;
  border-radius: @radius-sm;
  transition: background 0.2s ease;
}

.timeline-paragraph-highlight {
  background: @accent-light;
  border-radius: @radius-sm;
  transition: background 0.2s ease;
}
</style>
