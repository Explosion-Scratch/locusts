<template>
  <span
    v-if="!hasLoadError"
    class="bg-image-trigger"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @click="onClick"
    ref="triggerEl"
  >
    <svg
      class="bg-image-trigger__icon"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 256 256"
    >
      <path
        fill="currentColor"
        d="M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16M48 48h160v77.38l-24.69-24.7a16 16 0 0 0-22.62 0L53.37 208H48Zm160 160H76l96-96l36 36zM96 120a24 24 0 1 0-24-24a24 24 0 0 0 24 24m0-32a8 8 0 1 1-8 8a8 8 0 0 1 8-8"
      />
    </svg>
    <slot />
  </span>
  <span v-else>
    <slot />
  </span>

  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div v-if="showLightbox" class="lightbox-overlay" @click="closeLightbox">
        <div class="lightbox-container" @click.stopPropagation>
          <div class="lightbox-image-wrapper">
            <canvas
              v-if="blurhashData && !lightboxImgLoaded"
              ref="lightboxCanvasEl"
              class="lightbox-placeholder"
              :width="placeholderW"
              :height="placeholderH"
            />
            <img
              :src="getUrl()"
              :alt="resolvedAlt"
              :class="[
                'lightbox-image',
                { 'lightbox-image--loaded': lightboxImgLoaded },
              ]"
              @load="onLightboxImgLoad"
            />
          </div>
          <p v-if="resolvedAlt" class="lightbox-caption">{{ resolvedAlt }}</p>
          <button
            class="lightbox-close"
            @click="closeLightbox"
            aria-label="Close lightbox"
          >
            ×
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from "vue";
import { decode } from "blurhash";
import imagesData from "@/assets/images.json";
import { backgroundImageController as controller } from "@/utils/backgroundImageController";
import { resolveAssetUrl } from "@/utils/path";

const props = defineProps({
  url: String,
  asset: String,
  filter: {
    type: String,
    default: "none",
  },
  width: {
    type: [Number, String],
    default: 300,
  },
  opacity: {
    type: [Number, String],
    default: 0.8,
  },
});

const triggerEl = ref(null);
const parsedWidth = computed(() => parseFloat(props.width) || 500);

const showLightbox = ref(false);
const lightboxCanvasEl = ref(null);
const lightboxImgLoaded = ref(false);
const placeholderW = 32;
const placeholderH = 32;

const registryEntry = computed(() => {
  if (props.asset && imagesData[props.asset]) {
    return imagesData[props.asset];
  }
  if (props.url) {
    const slug =
      props.url
        .split("/")
        .pop()
        ?.replace(/\.[^.]+$/, "") || "";
    return imagesData[slug] || null;
  }
  return null;
});

const blurhashData = computed(() => registryEntry.value?.blurhash || "");

const resolvedAlt = computed(() => {
  return registryEntry.value?.alt || "";
});

const imageAspectRatio = computed(() => {
  if (registryEntry.value?.width && registryEntry.value?.height) {
    return registryEntry.value.width / registryEntry.value.height;
  }
  return 1;
});

function onLightboxImgLoad() {
  lightboxImgLoaded.value = true;
}

function renderLightboxBlurhash() {
  if (!blurhashData.value || !lightboxCanvasEl.value) return;
  try {
    const pixels = decode(blurhashData.value, placeholderW, placeholderH);
    const ctx = lightboxCanvasEl.value.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.createImageData(placeholderW, placeholderH);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  } catch {}
}

watch(showLightbox, (isOpen) => {
  if (isOpen) {
    lightboxImgLoaded.value = false;
    nextTick(() => renderLightboxBlurhash());
  }
});

const hasLoadError = ref(false);
const isImgLoaded = ref(false);

function checkImageLoad() {
  const url = getUrl();
  if (!url) {
    hasLoadError.value = true;
    return;
  }
  const img = new Image();
  img.src = url;
  img.onload = () => {
    hasLoadError.value = false;
  };
  img.onerror = () => {
    hasLoadError.value = true;
  };
}

onMounted(() => {
  checkImageLoad();
});

watch(
  () => getUrl(),
  () => {
    checkImageLoad();
  },
);

function checkMobile() {
  return window.innerWidth < 1100;
}

function onClick(e) {
  if (hasLoadError.value) return;
  e.preventDefault();
  e.stopPropagation();
  deactivate(triggerEl.value);
  showLightbox.value = true;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  showLightbox.value = false;
  document.body.style.overflow = "";
}

let isHovering = false;
let isActive = false;

function ensureImage() {
  if (controller.imgEl) return controller.imgEl;

  const img = document.createElement("img");
  img.className = "bg-image-floating";
  img.style.position = "fixed";
  img.style.zIndex = "-1";
  img.style.pointerEvents = "none";
  img.style.objectFit = "cover";
  img.style.borderRadius = "3px";
  img.style.boxShadow = "0 14px 36px rgba(35, 28, 18, 0.18)";
  img.style.transition =
    "opacity 0.24s ease, transform 0.35s ease, filter 0.3s ease";
  img.style.transform = "translateY(-50%) scale(0.98)";
  img.style.opacity = "0";
  img.style.top = `${controller.pos.y}px`;
  img.style.left = `${controller.pos.x}px`;
  document.body.appendChild(img);
  controller.imgEl = img;
  return img;
}

function getUrl() {
  let url = "";
  if (props.url) {
    url = props.url;
  } else if (props.asset && imagesData[props.asset]) {
    url = imagesData[props.asset].src;
  }
  return resolveAssetUrl(url);
}

function getDistance(x, y, rect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.sqrt(dx * dx + dy * dy);
}

function applyImageStyles() {
  const img = ensureImage();
  isImgLoaded.value = false;
  img.style.opacity = "0";

  const url = getUrl();
  const tempImg = new Image();
  tempImg.src = url;
  tempImg.onload = () => {
    if (controller.activeOwner === triggerEl.value && isActive) {
      img.src = url;
      isImgLoaded.value = true;
      img.style.opacity = String(props.opacity);
    }
  };
  tempImg.onerror = () => {
    deactivate(triggerEl.value);
  };

  // Width and height will be set in updateDestination
  img.style.filter = props.filter;
  img.style.transform = "translateY(-50%) scale(1)";
}

function deactivate(owner = null) {
  if (owner && controller.activeOwner !== owner) return;

  isActive = false;
  isImgLoaded.value = false;
  controller.activeOwner = null;
  if (controller.imgEl) {
    controller.imgEl.style.transform = "translateY(-50%) scale(0.98)";
    controller.imgEl.style.opacity = "0";
  }
  document.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("scroll", onScroll);
}

function onScroll() {
  isHovering = false;
  deactivate(triggerEl.value);
}

function onEnter(e) {
  if (checkMobile() || hasLoadError.value) return;
  isHovering = true;
  isActive = true;
  controller.activeOwner = triggerEl.value;
  
  applyImageStyles();
  
  updateDestination(e.clientY);
  controller.dest.y = e.clientY;

  document.removeEventListener("mousemove", onMouseMove);
  document.addEventListener("mousemove", onMouseMove);
  window.removeEventListener("scroll", onScroll);
  window.addEventListener("scroll", onScroll, { passive: true });
  if (!controller.frame) controller.frame = requestAnimationFrame(loop);
}

function onLeave(e) {
  isHovering = false;
  if (triggerEl.value && e) {
    const rect = triggerEl.value.getBoundingClientRect();
    const dist = getDistance(e.clientX, e.clientY, rect);
    if (dist >= 20) deactivate(triggerEl.value);
  }
}

function onMouseMove(e) {
  updateDestination(e.clientY);
  controller.dest.y = e.clientY;

  if (triggerEl.value && isActive) {
    const rect = triggerEl.value.getBoundingClientRect();
    const dist = getDistance(e.clientX, e.clientY, rect);

    if (isHovering || dist < 20) {
      if (controller.imgEl && isImgLoaded.value) {
        controller.imgEl.style.opacity = String(props.opacity);
        controller.imgEl.style.transform = "translateY(-50%) scale(1)";
      }
    } else {
      deactivate(triggerEl.value);
    }
  }
}

function updateDestination(mouseY) {
  const articleEl = document.querySelector(".article-content");
  const articleRect = articleEl?.getBoundingClientRect();
  const gap = 18;
  const preferredWidth = parsedWidth.value;
  
  let targetSide = 'right';
  let availableWidth = 0;
  
  if (articleRect) {
     const rightSpace = window.innerWidth - articleRect.right - gap * 2;
     const leftSpace = articleRect.left - gap * 2;
     
     let hoverCardOnRight = false;
     document.querySelectorAll('.hover-card').forEach(card => {
       const rect = card.getBoundingClientRect();
       if (rect.left > articleRect.right - 10 && rect.bottom > 0 && rect.top < window.innerHeight) {
         hoverCardOnRight = true;
       }
     });

     if (hoverCardOnRight) {
         targetSide = 'left';
         availableWidth = leftSpace;
     } else if (rightSpace >= preferredWidth) {
         targetSide = 'right';
         availableWidth = rightSpace;
     } else if (leftSpace >= preferredWidth) {
         targetSide = 'left';
         availableWidth = leftSpace;
     } else if (rightSpace >= leftSpace) {
         targetSide = 'right';
         availableWidth = rightSpace;
     } else {
         targetSide = 'left';
         availableWidth = leftSpace;
     }
  } else {
     targetSide = 'right';
     availableWidth = window.innerWidth - gap * 2;
  }
  
  const finalWidth = Math.max(50, Math.min(preferredWidth, availableWidth));
  const finalHeight = finalWidth / imageAspectRatio.value;
  
  let x = 0;
  if (targetSide === 'right') {
     x = articleRect ? articleRect.right + gap : window.innerWidth - finalWidth - gap;
  } else {
     x = articleRect ? articleRect.left - finalWidth - gap : gap;
  }
  
  controller.dest.x = Math.max(gap, Math.min(x, window.innerWidth - finalWidth - gap));
  controller.dest.y = Math.max(
    finalHeight / 2 + gap,
    Math.min(mouseY, window.innerHeight - finalHeight / 2 - gap)
  );

  if (controller.imgEl && isActive) {
      controller.imgEl.style.width = `${finalWidth}px`;
      controller.imgEl.style.height = `${finalHeight}px`;
  }
}

function loop() {
  controller.pos.x += (controller.dest.x - controller.pos.x) / 20;
  controller.pos.y += (controller.dest.y - controller.pos.y) / 20;

  if (controller.imgEl) {
    controller.imgEl.style.top = `${controller.pos.y}px`;
    controller.imgEl.style.left = `${controller.pos.x}px`;
  }

  if (
    !controller.activeOwner &&
    Math.abs(controller.dest.x - controller.pos.x) < 0.5 &&
    Math.abs(controller.dest.y - controller.pos.y) < 0.5
  ) {
    cancelAnimationFrame(controller.frame);
    controller.frame = null;
    return;
  }

  controller.frame = requestAnimationFrame(loop);
}

onUnmounted(() => {
  if (controller.activeOwner === triggerEl.value) deactivate(triggerEl.value);
  document.body.style.overflow = "";
});
</script>

<style lang="less" scoped>
.bg-image-trigger__icon {
  display: none;
}

.bg-image-trigger {
  cursor: pointer;
  background-image: linear-gradient(@accent-light, @accent-light);
  background-repeat: repeat-x;
  background-size: 100% 4px;
  background-position: 0 100%;
  padding-bottom: 1px;

  @media (max-width: 1100px) {
    .bg-image-trigger__icon {
      display: inline-block;
      vertical-align: text-bottom;
      margin-right: 4px;
      width: 0.95em;
      height: 0.95em;
      color: @accent;
    }
  }

  @media print {
    background-image: none !important;
    padding-bottom: 0 !important;
    cursor: default;
  }
}

.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 15, 15, 0.88);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5em;
}

.lightbox-container {
  position: relative;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-image-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.lightbox-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: blur(12px);
  transform: scale(1.05);
  border-radius: 4px;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity @transition-slow;

  &--loaded {
    opacity: 1;
  }
}

.lightbox-caption {
  margin-top: 1em;
  color: #f0ede9;
  font-family: "EB Garamond", serif;
  font-size: 0.95em;
  font-style: italic;
  text-align: center;
  line-height: 1.4;
  max-width: 500px;
}

.lightbox-close {
  position: absolute;
  top: -44px;
  right: 0;
  background: none;
  border: none;
  color: #fff;
  font-size: 2.2rem;
  font-weight: 300;
  cursor: pointer;
  padding: 0.2em;
  line-height: 0.8;
  opacity: 0.75;
  transition: opacity @transition-fast;

  &:hover {
    opacity: 1;
  }
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.28s ease;

  .lightbox-container {
    transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;

  .lightbox-container {
    transform: scale(0.96);
  }
}
</style>
