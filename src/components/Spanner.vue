<template>
  <div class="spanner-container">
    <div
      class="spanner screen-spanner"
      :class="{
        'is-animating': isAnimating && !jump,
        'is-jumpable': jump,
      }"
      :style="screenSpannerStyle"
      :aria-hidden="jump ? undefined : 'true'"
      @mouseenter="onMouseEnter"
    >
      <div class="spanner__track" :style="trackStyle">
        <template v-if="jump">
          <div
            v-for="item in items"
            :key="item.id"
            class="spanner__slot"
            :style="item.slotStyle"
          >
            <div
              class="jump-motion"
              :class="{ jumping: item.isJumping }"
              :data-spanner-id="item.id"
              :style="item.jumpStyle"
              @animationend="onItemJumpEnd(item.id, $event)"
            >
              <img
                :src="item.src"
                :style="item.imgStyle"
                class="spanner__image"
                loading="lazy"
                alt=""
                draggable="false"
                @click="onItemClick(item.id)"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <img
            v-for="(item, i) in screenImages"
            :key="i"
            :src="item.src"
            :style="item.style"
            class="spanner__image"
            loading="lazy"
            alt=""
          />
        </template>
      </div>
    </div>

    <!-- Print Spanner -->
    <div
      class="spanner print-spanner"
      :style="printSpannerStyle"
      aria-hidden="true"
    >
      <div class="spanner__track" :style="trackStyle">
        <img
          v-for="(item, i) in printImages"
          :key="'print-' + i"
          :src="item.src"
          :style="item.style"
          class="spanner__image"
          loading="lazy"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import {
  randomRange,
  defaultJumpStyle,
  createJumpController,
  handleJumpAnimationEnd,
} from "../composables/useJump";
import { resolveAssetUrl } from "@/utils/path";

const props = defineProps({
  height: { type: Number, default: 128 },
  srcs: { type: Array, default: () => [] },
  widths: { type: Array, default: () => [] },
  mode: { type: String, default: "repeating" },
  overlap: { type: Number, default: 0.6 },
  jump: { type: Boolean, default: false },
});

const screenWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1200,
);

function handleResize() {
  screenWidth.value = window.innerWidth;
}

const isAnimating = ref(false);
let animationTimeout = null;

function onMouseEnter() {
  if (props.jump || isAnimating.value) return;
  isAnimating.value = true;
  const numImages = screenImages.value.length;
  const duration = numImages * 80 + 400;
  if (animationTimeout) clearTimeout(animationTimeout);
  animationTimeout = setTimeout(() => {
    isAnimating.value = false;
  }, duration);
}

const { stopJumpTilt, triggerJump: runJump } = createJumpController(
  (id) => document.querySelector(`[data-spanner-id="${id}"]`),
  (id) => document.querySelector(`[data-spanner-id="${id}"] .spanner__image`),
);

const items = ref([]);

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function jumpDirectionFromSrc(src, leftPx, imgWidth) {
  if (src.includes("/left/")) return "left";
  if (src.includes("/right/")) return "right";
  const center = leftPx + imgWidth / 2;
  return center < screenWidth.value / 2 ? "left" : "right";
}

function buildLayoutEntries() {
  if (!props.srcs.length) return [];

  const currentHeight = props.height;
  const currentOverlap = props.overlap;
  const viewportWidth = Math.max(screenWidth.value, 2560);
  const itemHeight = currentHeight * 0.8;
  const entries = [];
  const rng = seededRandom(42);
  const isRandom = props.mode === "random";

  let x = -20;
  let idx = 0;

  while (x < viewportWidth + 200) {
    const srcIdx = isRandom
      ? Math.floor(rng() * props.srcs.length)
      : idx % props.srcs.length;

    const w = props.widths[srcIdx] || props.widths[0] || 100;
    const scale = itemHeight / 100;
    const imgW = w * scale;
    const stepX = imgW * currentOverlap;

    const yVariation = currentHeight * 0.15;
    const yOffset = isRandom
      ? (rng() - 0.5) * yVariation * 2
      : idx % 2 === 0
        ? -yVariation
        : yVariation;

    const y = (currentHeight - itemHeight) / 2 + yOffset;
    const rotation = isRandom ? (rng() - 0.5) * 12 : idx % 2 === 0 ? -2 : 2;

    entries.push({
      layoutIdx: idx,
      src: props.srcs[srcIdx],
      leftPx: x,
      imgWidth: imgW,
      itemHeight,
      y,
      rotation,
      zIndex: idx,
    });

    x += stepX;
    idx++;
    if (idx > 100) break;
  }

  return entries;
}

function entryToItem(entry, existing) {
  const slotStyle = {
    position: "absolute",
    left: `${entry.leftPx}px`,
    top: `${entry.y}px`,
    width: `${entry.imgWidth}px`,
    height: `${entry.itemHeight}px`,
    zIndex: entry.zIndex,
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transform: `rotate(${entry.rotation}deg)`,
    "--rotation": `rotate(${entry.rotation}deg)`,
  };

  if (existing?.isJumping) {
    return {
      ...existing,
      slotStyle,
      imgStyle,
      leftPx: entry.leftPx,
      imgWidth: entry.imgWidth,
      src: resolveAssetUrl(entry.src),
    };
  }

  return {
    id: existing?.id ?? `spanner-${entry.layoutIdx}`,
    layoutIdx: entry.layoutIdx,
    src: resolveAssetUrl(entry.src),
    leftPx: entry.leftPx,
    imgWidth: entry.imgWidth,
    slotStyle,
    imgStyle,
    isJumping: false,
    jumpStyle: defaultJumpStyle(),
    offsetX: 0,
  };
}

function rebuildItems() {
  const entries = buildLayoutEntries();
  const byLayoutIdx = new Map(
    items.value.map((item) => [item.layoutIdx, item]),
  );

  items.value = entries.map((entry) =>
    entryToItem(entry, byLayoutIdx.get(entry.layoutIdx)),
  );
}

watch(
  () => [
    props.srcs,
    props.widths,
    props.mode,
    props.overlap,
    props.height,
    screenWidth.value,
    props.jump,
  ],
  () => {
    if (props.jump) rebuildItems();
  },
  { immediate: true, deep: true },
);

const screenSpannerStyle = computed(() => {
  return {
    height: `${props.height}px`,
  };
});

const printSpannerStyle = computed(() => {
  return {
    height: `${props.height * 0.55}px`,
  };
});

function generateImages(isPrint) {
  if (!props.srcs.length) return [];

  const currentHeight = isPrint ? props.height * 0.55 : props.height;
  const currentOverlap = isPrint ? 0.5 : props.overlap;
  const viewportWidth = isPrint ? 1500 : Math.max(screenWidth.value, 2560);
  const itemHeight = currentHeight * 0.8;
  const images = [];
  const rng = seededRandom(42);
  const isRandom = props.mode === "random";

  let x = -20;
  let idx = 0;

  while (x < viewportWidth + 200) {
    const srcIdx = isRandom
      ? Math.floor(rng() * props.srcs.length)
      : idx % props.srcs.length;

    const w = props.widths[srcIdx] || props.widths[0] || 100;
    const scale = itemHeight / 100;
    const imgW = w * scale;
    const stepX = imgW * currentOverlap;

    const yVariation = currentHeight * 0.15;
    const yOffset = isRandom
      ? (rng() - 0.5) * yVariation * 2
      : idx % 2 === 0
        ? -yVariation
        : yVariation;

    const y = (currentHeight - itemHeight) / 2 + yOffset;
    const rotation = isRandom ? (rng() - 0.5) * 12 : idx % 2 === 0 ? -2 : 2;

    images.push({
      src: resolveAssetUrl(props.srcs[srcIdx]),
      style: {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${imgW}px`,
        height: `${itemHeight}px`,
        objectFit: "contain",
        transform: "var(--rotation)",
        zIndex: idx,
        "--img-index": idx,
        "--rotation": `rotate(${rotation}deg)`,
      },
    });

    x += stepX;
    idx++;
    if (idx > 200) break;
  }

  return images;
}

const screenImages = computed(() => generateImages(false));
const printImages = computed(() => generateImages(true));

const trackStyle = computed(() => ({
  position: "relative",
  width: "100%",
  height: "100%",
}));

function exitForward(item) {
  const direction = jumpDirectionFromSrc(item.src, item.leftPx, item.imgWidth);
  const vw = screenWidth.value;
  if (direction === "left") {
    return -(item.leftPx + item.imgWidth + 120);
  }
  return vw - item.leftPx + 120;
}

const onItemClick = async (id) => {
  const item = items.value.find((i) => i.id === id);
  if (!item || item.isJumping) return;

  const forward = exitForward(item);

  await runJump(
    id,
    item,
    {
      forward,
      jumpHeight: randomRange(100, 200),
      startX: item.offsetX,
      facingRight: forward > 0,
      onComplete: () => removeItem(id),
    },
    () => nextTick(),
    (jumping) => {
      item.isJumping = jumping;
    },
  );
};

const removeItem = (id) => {
  const item = items.value.find((i) => i.id === id);
  if (item) stopJumpTilt(id, item);
  items.value = items.value.filter((i) => i.id !== id);
};

const onItemJumpEnd = (id, event) => {
  const item = items.value.find((i) => i.id === id);
  if (!item) return;
  handleJumpAnimationEnd(event, item, () => removeItem(id));
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (animationTimeout) clearTimeout(animationTimeout);
  items.value.forEach((item) => {
    if (item.jumpTimer) clearTimeout(item.jumpTimer);
    stopJumpTilt(item.id, item);
  });
});
</script>

<style lang="less" scoped>
.spanner-container {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-top: 4em;
  margin-bottom: 2em;
}

.spanner {
  position: relative;
  width: 100%;
}

.spanner:not(.is-jumpable) {
  overflow: hidden;
}

.spanner__track {
  position: relative;
  width: 100%;
  height: 100%;
}

.spanner__slot {
  pointer-events: auto;
}

.spanner__image {
  transition: transform 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  display: block;
}

.spanner.is-jumpable .spanner__image {
  cursor: pointer;
}

.jump-motion.jumping .spanner__image {
  pointer-events: none;
  cursor: default;
}

.spanner.is-animating .spanner__image {
  animation: spanner-ripple 0.4s ease-in-out;
  animation-delay: calc(var(--img-index) * 0.08s);
}

@keyframes spanner-ripple {
  0%,
  100% {
    transform: var(--rotation) translateY(0);
  }
  50% {
    transform: var(--rotation) translateY(-3px);
  }
}

.screen-spanner {
  display: block;
}

.print-spanner {
  display: none;
}

@media print {
  .spanner-container {
    width: 160vw !important;
    margin-left: calc(-50vw + 50%) !important;
    margin-right: 0 !important;
    left: -30vw !important;
    right: -30vw !important;
    overflow: hidden !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .screen-spanner {
    display: none !important;
  }

  .print-spanner {
    display: block !important;
  }
}
</style>
