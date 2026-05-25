<template>
  <nav
    class="toc"
    :class="{ 'toc--open': mobileOpen }"
    aria-label="Table of contents"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <button class="toc__toggle" @click.stop="mobileOpen = !mobileOpen">
      <span class="toc__toggle-dot"></span>
    </button>
    <div class="toc__list-wrapper" :class="{ 'toc__list-wrapper--visible': hovered }">
      <h2 class="toc__print-title">Table of Contents</h2>
      <div class="toc__scroll-content">
        <svg class="toc-marker" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <path
            class="toc-marker__path"
          />
        </svg>
        <ul class="toc__list">
          <li
            v-for="item in tocItems"
            :key="item.id"
            :class="[
              'toc__item',
              `toc__item--h${item.level}`,
              { 'toc__item--active': activeIds.includes(item.id) },
            ]"
          >
            <a
              :href="`#${item.id}`"
              class="toc__link"
              @click.prevent="scrollTo(item.id)"
            >
              {{ item.text }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';

const tocItems = ref([]);
const activeIds = ref([]);
const mobileOpen = ref(false);
const hovered = ref(false);
let observer = null;
let resizeObserver = null;
const linkDistances = new WeakMap();

function buildToc() {
  const article = document.querySelector('.article-content');
  if (!article) return;

  const headings = article.querySelectorAll('h2, h3, h4');
  tocItems.value = Array.from(headings).map((el) => {
    if (!el.id) {
      el.id = el.textContent
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    return {
      id: el.id,
      text: el.textContent.replace(/#$/, '').trim(),
      level: parseInt(el.tagName[1]),
    };
  });
}

function setupObserver() {
  const headingEls = tocItems.value
    .map((item) => document.getElementById(item.id))
    .filter(Boolean);

  if (!headingEls.length) return;

  const intersectingSet = new Set();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingSet.add(entry.target.id);
        } else {
          intersectingSet.delete(entry.target.id);
        }
      });

      const active = [];
      tocItems.value.forEach((item) => {
        if (intersectingSet.has(item.id)) {
          active.push(item.id);
        }
      });

      if (active.length > 0) {
        activeIds.value = active;
      } else {
        const headings = tocItems.value
          .map((item) => document.getElementById(item.id))
          .filter(Boolean);

        let lastAbove = null;
        for (const el of headings) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            lastAbove = el.id;
          } else {
            break;
          }
        }
        activeIds.value = lastAbove ? [lastAbove] : (tocItems.value[0] ? [tocItems.value[0].id] : []);
      }
    },
    {
      rootMargin: '-60px 0px -10% 0px',
      threshold: 0,
    }
  );

  headingEls.forEach((el) => observer.observe(el));
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) {
    history.replaceState(null, '', `#${id}`);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    mobileOpen.value = false;
  }
}

function drawPath() {
  const container = document.querySelector('.toc__list');
  if (!container) return;

  const links = Array.from(container.querySelectorAll('.toc__link'));
  if (links.length === 0) return;

  const path = [];
  let prevX = 0;
  let prevYBottom = 0;

  const pathSvg = container.parentElement.querySelector('.toc-marker__path');
  if (!pathSvg) return;

  links.forEach((link, i) => {
    const x = link.offsetLeft;
    const yTop = link.offsetTop;
    const yBottom = yTop + link.offsetHeight;

    if (i === 0) {
      path.push(`M ${x} ${yTop}`);
      pathSvg.setAttribute('d', path.join(' '));
      linkDistances.set(link, { start: 0 });
      
      path.push(`L ${x} ${yBottom}`);
      pathSvg.setAttribute('d', path.join(' '));
      linkDistances.get(link).end = pathSvg.getTotalLength();
    } else {
      if (x !== prevX) {
        const midY = prevYBottom + (yTop - prevYBottom) / 2;
        path.push(`C ${prevX} ${midY}, ${x} ${midY}, ${x} ${yTop}`);
      } else {
        path.push(`L ${x} ${yTop}`);
      }
      
      pathSvg.setAttribute('d', path.join(' '));
      linkDistances.set(link, { start: pathSvg.getTotalLength() });
      
      path.push(`L ${x} ${yBottom}`);
      pathSvg.setAttribute('d', path.join(' '));
      linkDistances.get(link).end = pathSvg.getTotalLength();
    }

    prevX = x;
    prevYBottom = yBottom;
  });

  pathSvg.dataset.totalLength = pathSvg.getTotalLength().toString();
}

function updatePath() {
  const container = document.querySelector('.toc__list');
  if (!container) return;

  const pathSvg = container.parentElement.querySelector('.toc-marker__path');
  if (!pathSvg) return;

  const totalLength = parseFloat(pathSvg.dataset.totalLength) || 0;

  const activeLinks = tocItems.value
    .filter((item) => activeIds.value.includes(item.id))
    .map((item) => container.querySelector(`.toc__link[href="#${item.id}"]`))
    .filter(Boolean);

  if (activeLinks.length > 0) {
    const firstLink = activeLinks[0];
    const lastLink = activeLinks[activeLinks.length - 1];

    if (linkDistances.has(firstLink) && linkDistances.has(lastLink)) {
      const start = linkDistances.get(firstLink).start;
      const end = linkDistances.get(lastLink).end;
      const dashLength = end - start;
      pathSvg.style.strokeDasharray = `0 ${start} ${dashLength} ${totalLength}`;
    }
  } else {
    pathSvg.style.strokeDasharray = `0 0 0 ${totalLength}`;
  }
}

function handleClickOutside(e) {
  if (mobileOpen.value) {
    const tocEl = document.querySelector('.toc');
    if (tocEl && !tocEl.contains(e.target)) {
      mobileOpen.value = false;
    }
  }
}

watch(activeIds, (newIds) => {
  nextTick(() => {
    updatePath();
    const activeId = newIds[0];
    if (activeId) {
      const container = document.querySelector('.toc__list');
      const activeLink = container?.querySelector(`.toc__link[href="#${activeId}"]`);
      const activeEl = activeLink?.parentElement;
      const wrapper = document.querySelector('.toc__list-wrapper');
      if (activeEl && wrapper) {
        const activeTop = activeEl.offsetTop;
        const activeHeight = activeEl.offsetHeight;
        const wrapperHeight = wrapper.clientHeight;
        wrapper.scrollTo({
          top: activeTop - wrapperHeight / 2 + activeHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  });
}, { deep: true });

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  await nextTick();
  setTimeout(() => {
    buildToc();
    nextTick(() => {
      setupObserver();
      const tocList = document.querySelector('.toc__list');
      if (tocList) {
        resizeObserver = new ResizeObserver(() => {
          drawPath();
          updatePath();
        });
        resizeObserver.observe(tocList);
      }
    });
  }, 100);
});

onUnmounted(() => {
  observer?.disconnect();
  resizeObserver?.disconnect();
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="less" scoped>
.toc {
  position: fixed;
  top: 40px;
  left: calc((100vw - var(--article-max-width)) / 2 - 220px);
  width: 145px;
  z-index: 50;
  opacity: 0.15;
  transition: opacity 0.35s ease;

  &:hover {
    opacity: 1;
  }

  @media (max-width: 1100px) {
    position: fixed;
    top: 20px;
    right: 20px;
    left: auto;
    width: auto;
    z-index: 100;
    opacity: 1;
  }

  @media print {
    position: static;
    float: right;
    width: 35%;
    opacity: 1;
    margin: 0 0 1.5em 1.5em !important;
  }
}

.toc__print-title {
  display: none;
  @media print {
    display: block;
    font-size: 11pt;
    font-family: @font-display;
    font-weight: 800;
    margin: 0 0 0.4em 0;
    padding-bottom: 0.2em;
    border-bottom: 1px solid #222;
    color: #000;
  }
}

.toc__toggle {
  display: none;

  @media (max-width: 1100px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: transform @transition-fast;
  }

  @media print {
    display: none;
  }
}

.toc__toggle-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: @text-muted;
  transition: background-color @transition-fast, transform @transition-fast;

  .toc__toggle:hover & {
    background-color: @text;
    transform: scale(1.25);
  }
}

.toc__list-wrapper {
  position: relative;

  @media (min-width: 1101px) {
    max-height: calc(100vh - 80px);
    overflow-y: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  @media (max-width: 1100px) {
    position: absolute;
    top: 50px;
    right: 0;
    width: 200px;
    background: @bg-elevated;
    border: 1px solid @border;
    border-radius: 8px 0 8px 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    transition: max-height 0.3s ease, opacity 0.3s ease;

    .toc--open & {
      max-height: 400px;
      opacity: 1;
      pointer-events: auto;
    }
  }

  @media print {
    position: static;
    max-height: none;
    opacity: 1;
    overflow: visible;
    box-shadow: none;
    border: none;
  }
}

.toc__scroll-content {
  position: relative;
}

.toc-marker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;

  @media (max-width: 1100px) {
    display: none;
  }

  @media print {
    display: none;
  }
}

.toc-marker__path {
  fill: none;
  stroke: @accent;
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke-dasharray 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.toc__list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 2;

  @media (max-width: 1100px) {
    padding: 12px;
  }
}

.toc__item {
  &--h3 {
    padding-left: 0.8em;
  }

  &--h4 {
    padding-left: 1.6em;
  }

  @media print {
    margin-bottom: 0.1em !important;
  }
}

.toc__link {
  display: block;
  padding: 0.25em 0;
  color: @text-muted;
  font-size: font-size(0.72);
  font-family: @font-toc;
  text-decoration: none;
  padding-left: 0.8em;
  transition: color @transition-fast;
  line-height: 1.3;
  background-image: none !important;

  &:hover {
    color: @text;
    background-image: none !important;
  }

  .toc__item--active & {
    color: @accent;
    transition: color 0.3s ease;
  }

  .toc__item--h2 & {
    font-weight: 400;
    font-style: normal;
  }

  .toc__item--h3 & {
    font-weight: 400;
    font-style: normal;
  }

  .toc__item--h4 & {
    font-weight: 400;
    font-style: italic;
  }

  @media (max-width: 1100px) {
    font-size: font-size(0.85);
    padding: 6px 8px;
    border-radius: 4px;

    &:hover {
      background: @bg-subtle;
    }

    .toc__item--active & {
      background: @accent-faint;
    }
  }

  @media print {
    color: #111 !important;
    line-height: 1.15 !important;
    padding: 0.03em 0 !important;
    font-family: @font-toc !important;

    .toc__item--h2 & {
      font-size: 9.5pt !important;
      font-weight: 400 !important;
      font-style: normal !important;
      color: #000 !important;
      margin-top: 0.25em !important;
    }

    .toc__item--h3 & {
      font-size: 8.5pt !important;
      font-weight: 400 !important;
      font-style: italic !important;
      color: #222 !important;
    }

    .toc__item--h4 & {
      font-size: 8pt !important;
      font-weight: 400 !important;
      font-style: italic !important;
      color: #555 !important;
    }

    .toc__item--active & {
      color: inherit !important;
      background: transparent !important;
    }
  }
}
</style>
