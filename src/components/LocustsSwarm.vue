<template>
  <div class="locusts-container">
    <div
      v-for="p in particles"
      :key="p.id"
      class="locust-particle"
      :class="p.data.direction"
      :style="p.data.walkStyle"
      @animationend="onWalkEnd(p.id, $event)"
    >
      <div
        class="jump-motion"
        :class="{ jumping: p.data.isJumping }"
        :data-locust-id="p.id"
        :style="p.data.jumpStyle"
        @animationend="onJumpEnd(p.id, $event)"
      >
        <img
          class="locust-img"
          :class="{ wiggle: !p.data.isJumping, 'is-jumping': p.data.isJumping }"
          :src="p.data.image"
          :style="p.data.imgStyle"
          @click.stop="triggerJump(p.id)"
          alt="Locust"
          draggable="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from 'vue';
import {
  randomRange,
  defaultJumpStyle,
  createJumpController,
  handleJumpAnimationEnd,
  type JumpTiltState,
} from '../composables/useJump';
import { useParticles, type Particle } from '../helpers/particles';

const props = withDefaults(
  defineProps<{
    /** Average seconds between spawning new locusts */
    frequency?: number;
  }>(),
  { frequency: 10 }
);

import l1 from '../assets/locusts/left/locust-1.png';
import l2 from '../assets/locusts/left/locust-2.png';
import l3 from '../assets/locusts/left/locust-3.png';
import l4 from '../assets/locusts/left/locust-4.png';

import r1 from '../assets/locusts/right/locust-1.png';
import r2 from '../assets/locusts/right/locust-2.png';
import r3 from '../assets/locusts/right/locust-3.png';
import r4 from '../assets/locusts/right/locust-4.png';

const LEFT_IMAGES = [l1, l2, l3, l4];
const RIGHT_IMAGES = [r1, r2, r3, r4];

interface LocustData extends JumpTiltState {
  direction: 'left' | 'right';
  walkDurationSec: number;
  widthPx: number;
  image: string;
  walkStyle: Record<string, string>;
  imgStyle: Record<string, string>;
  offsetX: number;
}

const { particles, spawn, remove, clear } = useParticles<LocustData>();
let spawnTimeout: ReturnType<typeof setTimeout>;
let jumpInterval: ReturnType<typeof setInterval>;
let nextSpawnAt = 0;

const WALK_DURATION_MIN = 16;
const WALK_DURATION_MAX = 20;
const MIN_GAP_PX = 360;
const EDGE_BUFFER_PX = 150;
const SPAWN_POLL_MS = 120;
const DOUBLE_TAP_MS = 400;

const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const { stopJumpTilt, triggerJump: runJump } = createJumpController(
  (id) => document.querySelector(`[data-locust-id="${id}"]`) as HTMLElement | null,
  (id) =>
    document.querySelector(`[data-locust-id="${id}"] .locust-img`) as HTMLElement | null
);

const spawnIntervalMs = () => props.frequency * randomRange(0.75, 1.25) * 1000;

const getLocustRect = (p: Particle<LocustData>) => {
  const el = document.querySelector(`[data-locust-id="${p.id}"]`)?.closest('.locust-particle');
  return el instanceof HTMLElement ? el.getBoundingClientRect() : null;
};

const horizontalClearance = (
  aLeft: number,
  aRight: number,
  bLeft: number,
  bRight: number
) => Math.max(bLeft - aRight, aLeft - bRight);

const spawnSlot = (direction: 'left' | 'right', widthPx: number) => {
  const vw = window.innerWidth;
  const left = direction === 'left' ? vw + EDGE_BUFFER_PX : -EDGE_BUFFER_PX;
  return { left, right: left + widthPx };
};

const canSpawnFromEdge = (direction: 'left' | 'right', widthPx: number) => {
  const slot = spawnSlot(direction, widthPx);
  for (const p of particles.value) {
    const rect = getLocustRect(p);
    if (!rect) continue;
    if (horizontalClearance(slot.left, slot.right, rect.left, rect.right) < MIN_GAP_PX) {
      return false;
    }
  }
  return true;
};

const walkDurationForSpawn = (direction: 'left' | 'right') => {
  const sameDir = particles.value.filter(p => p.data.direction === direction);
  const maxDur = sameDir.reduce((m, p) => Math.max(m, p.data.walkDurationSec), 0);
  if (!maxDur) return randomRange(WALK_DURATION_MIN, WALK_DURATION_MAX);
  return Math.min(WALK_DURATION_MAX, maxDur + randomRange(0, 2));
};

const pickSpawnDirection = (widthPx: number): 'left' | 'right' | null => {
  const canLeft = canSpawnFromEdge('left', widthPx);
  const canRight = canSpawnFromEdge('right', widthPx);
  if (!canLeft && !canRight) return null;
  if (canLeft && canRight) return Math.random() > 0.5 ? 'left' : 'right';
  return canLeft ? 'left' : 'right';
};

const spawnLocust = (direction: 'left' | 'right', widthPx = randomRange(100, 120)) => {
  const image = direction === 'left' ? randomChoice(LEFT_IMAGES) : randomChoice(RIGHT_IMAGES);
  const walkDurationSec = walkDurationForSpawn(direction);
  const wiggleDuration = randomRange(0.2, 0.6);

  spawn({
    direction,
    walkDurationSec,
    widthPx,
    image,
    isJumping: false,
    offsetX: 0,
    walkStyle: {
      '--walk-duration': `${walkDurationSec}s`,
    },
    jumpStyle: defaultJumpStyle(),
    imgStyle: {
      width: `${widthPx}px`,
      '--wiggle-duration': `${wiggleDuration}s`,
    }
  });
};

const tryAutoSpawn = () => {
  const widthPx = randomRange(100, 120);
  const direction = pickSpawnDirection(widthPx);
  if (!direction) return;
  spawnLocust(direction, widthPx);
  nextSpawnAt = Date.now() + spawnIntervalMs();
};

const scheduleSpawnLoop = () => {
  if (Date.now() >= nextSpawnAt) tryAutoSpawn();
  spawnTimeout = setTimeout(scheduleSpawnLoop, SPAWN_POLL_MS);
};

const isLocustTarget = (target: EventTarget | null) =>
  target instanceof Element && !!target.closest('.locust-particle');

let lastManualSpawnAt = 0;

const onManualSpawn = () => {
  const now = Date.now();
  if (now - lastManualSpawnAt < 500) return;
  lastManualSpawnAt = now;
  const widthPx = randomRange(100, 120);
  const direction = pickSpawnDirection(widthPx) ?? (Math.random() > 0.5 ? 'left' : 'right');
  spawnLocust(direction, widthPx);
};

const onDocumentDblClick = (e: MouseEvent) => {
  if (isLocustTarget(e.target)) return;
  onManualSpawn();
};

let lastManualTapAt = 0;

const onDocumentTouchEnd = (e: TouchEvent) => {
  if (isLocustTarget(e.target)) return;
  const now = Date.now();
  if (now - lastManualTapAt < DOUBLE_TAP_MS) {
    lastManualTapAt = 0;
    onManualSpawn();
  } else {
    lastManualTapAt = now;
  }
};

const finishJump = (id: string) => {
  const p = particles.value.find(p => p.id === id);
  if (!p || !p.data.isJumping) return;

  stopJumpTilt(id, p.data);

  const forward = parseFloat(p.data.jumpStyle['--jump-forward'] || '0');
  p.data.offsetX += forward;
  p.data.isJumping = false;
  p.data.jumpStyle = defaultJumpStyle(p.data.offsetX);
};

const triggerJump = async (id: string) => {
  const p = particles.value.find(p => p.id === id);
  if (!p || p.data.isJumping) return;

  const forward = randomRange(60, 180) * (p.data.direction === 'left' ? -1 : 1);

  await runJump(
    id,
    p.data,
    {
      forward,
      startX: p.data.offsetX,
      facingRight: p.data.direction === 'right',
      onComplete: () => finishJump(id),
    },
    () => nextTick(),
    (jumping) => { p.data.isJumping = jumping; }
  );
};

const onWalkEnd = (id: string, event: AnimationEvent) => {
  if (event.animationName === 'walkLeft' || event.animationName === 'walkRight') {
    const p = particles.value.find(p => p.id === id);
    if (p) {
      if (p.data.jumpTimer) clearTimeout(p.data.jumpTimer);
      stopJumpTilt(id, p.data);
    }
    remove(id);
  }
};

const onJumpEnd = (id: string, event: AnimationEvent) => {
  const p = particles.value.find(p => p.id === id);
  if (!p) return;
  handleJumpAnimationEnd(event, p.data, () => finishJump(id));
};

const randomJumpLoop = () => {
  // Every couple seconds, try to jump a random locust (1 out of 5 chance for each roughly)
  particles.value.forEach(p => {
    if (!p.data.isJumping && Math.random() < 0.2) {
      triggerJump(p.id);
    }
  });
};

onMounted(() => {
  nextSpawnAt = Date.now() + spawnIntervalMs();
  spawnTimeout = setTimeout(scheduleSpawnLoop, SPAWN_POLL_MS);
  jumpInterval = setInterval(randomJumpLoop, 2000);
  document.addEventListener('dblclick', onDocumentDblClick);
  document.addEventListener('touchend', onDocumentTouchEnd, { passive: true });
});

onUnmounted(() => {
  clearTimeout(spawnTimeout);
  clearInterval(jumpInterval);
  document.removeEventListener('dblclick', onDocumentDblClick);
  document.removeEventListener('touchend', onDocumentTouchEnd);
  clear();
});
</script>

<style scoped>
.locusts-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}

.locust-particle {
  position: fixed;
  bottom: 0;
}

.locust-particle.left {
  /* Walking left: start right edge, end left edge */
  animation: walkLeft var(--walk-duration) linear forwards;
}

.locust-particle.right {
  /* Walking right: start left edge, end right edge */
  animation: walkRight var(--walk-duration) linear forwards;
}

@keyframes walkLeft {
  from { left: calc(100vw + 150px); }
  to { left: -150px; }
}

@keyframes walkRight {
  from { left: -150px; }
  to { left: calc(100vw + 150px); }
}

.jump-motion {
  pointer-events: auto;
}

.locust-img {
  pointer-events: auto;
  transform-origin: bottom center;
  cursor: pointer;
  display: block;
  height: auto;
}

.jump-motion.jumping .locust-img {
  pointer-events: none;
  cursor: default;
}

.locust-img.wiggle {
  animation: wiggle var(--wiggle-duration) ease-in-out infinite alternate;
}

@keyframes wiggle {
  0% { transform: rotate(-3deg) skewX(-2deg); }
  100% { transform: rotate(3deg) skewX(2deg); }
}

@media print {
  .locusts-container {
    display: none !important;
  }
}

</style>
