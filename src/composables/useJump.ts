export type JumpStyle = Record<string, string>;

export interface JumpTiltState {
  isJumping: boolean;
  jumpStyle: JumpStyle;
  jumpTimer?: ReturnType<typeof setTimeout>;
  jumpTiltRaf?: number;
  launchTilt?: number;
  landTilt?: number;
  jumpStartTime?: number;
  jumpDuration?: number;
}

const GROUND_BLEND_PX = 20;
const FLAT_ANGLE = 0;

export const randomRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const defaultJumpStyle = (startX = 0): JumpStyle => ({
  '--jump-duration': '0s',
  '--jump-height': '0px',
  '--jump-forward': '0px',
  '--start-x': `${startX}px`,
});

export const computeTilts = (
  jumpHeight: number,
  forward: number,
  facingRight: boolean
) => {
  const tiltDeg = Math.min(
    42,
    Math.max(12, (Math.atan2(jumpHeight, Math.abs(forward) * 0.65) * 180) / Math.PI)
  );
  const launchTilt = facingRight ? -tiltDeg : tiltDeg;
  const landTilt = facingRight ? tiltDeg : -tiltDeg;
  return { launchTilt, landTilt };
};

const trajectoryTilt = (progress: number, launch: number, land: number) => {
  if (progress <= 0.5) {
    return launch * (1 - progress / 0.5);
  }
  return land * ((progress - 0.5) / 0.5);
};

const blendNearGround = (
  trajAngle: number,
  heightAboveGround: number,
  descending: boolean
) => {
  if (!descending || heightAboveGround >= GROUND_BLEND_PX) return trajAngle;
  const linear = (GROUND_BLEND_PX - heightAboveGround) / GROUND_BLEND_PX;
  const flatWeight = 1 - (1 - linear) ** 3;
  return trajAngle * (1 - flatWeight) + FLAT_ANGLE * flatWeight;
};

export interface TriggerJumpOptions {
  jumpHeight?: number;
  jumpDuration?: number;
  forward: number;
  startX?: number;
  facingRight: boolean;
  onComplete: () => void;
}

export const createJumpController = (
  getJumpEl: (id: string) => HTMLElement | null,
  getImgEl: (id: string) => HTMLElement | null
) => {
  const stopJumpTilt = (id: string, state: JumpTiltState) => {
    if (state.jumpTiltRaf) {
      cancelAnimationFrame(state.jumpTiltRaf);
      state.jumpTiltRaf = undefined;
    }
    const img = getImgEl(id);
    if (img) img.style.transform = '';
  };

  const runJumpTilt = (id: string, state: JumpTiltState) => {
    if (!state.isJumping || state.launchTilt === undefined || !state.jumpDuration) return;

    const jumpEl = getJumpEl(id);
    const imgEl = getImgEl(id);

    if (jumpEl && imgEl) {
      const elapsed = (performance.now() - (state.jumpStartTime ?? 0)) / 1000;
      const progress = Math.min(1, elapsed / state.jumpDuration);
      const descending = progress > 0.5;
      let angle = trajectoryTilt(progress, state.launchTilt, state.landTilt ?? 0);
      const translateY = new DOMMatrix(getComputedStyle(jumpEl).transform).m42;
      const heightAboveGround = Math.max(0, -translateY);
      angle = blendNearGround(angle, heightAboveGround, descending);
      imgEl.style.transform = `rotate(${angle}deg)`;
    }

    if (state.isJumping) {
      state.jumpTiltRaf = requestAnimationFrame(() => runJumpTilt(id, state));
    }
  };

  const startJumpTilt = (
    id: string,
    state: JumpTiltState,
    launchTilt: number,
    landTilt: number,
    jumpDuration: number
  ) => {
    stopJumpTilt(id, state);
    state.launchTilt = launchTilt;
    state.landTilt = landTilt;
    state.jumpStartTime = performance.now();
    state.jumpDuration = jumpDuration;
    state.jumpTiltRaf = requestAnimationFrame(() => runJumpTilt(id, state));
  };

  const triggerJump = async (
    id: string,
    state: JumpTiltState,
    options: TriggerJumpOptions,
    resetJumpClass: () => Promise<void>,
    setJumping: (jumping: boolean) => void
  ) => {
    if (state.isJumping) return;

    const jumpHeight = options.jumpHeight ?? randomRange(100, 400);
    const jumpDuration = options.jumpDuration ?? randomRange(0.8, 1.5);
    const { launchTilt, landTilt } = computeTilts(
      jumpHeight,
      options.forward,
      options.facingRight
    );

    if (state.jumpTimer) clearTimeout(state.jumpTimer);

    setJumping(false);
    await resetJumpClass();

    state.jumpStyle = {
      '--jump-duration': `${jumpDuration}s`,
      '--jump-height': `${jumpHeight}px`,
      '--jump-forward': `${options.forward}px`,
      '--start-x': `${options.startX ?? 0}px`,
    };

    await resetJumpClass();
    setJumping(true);
    startJumpTilt(id, state, launchTilt, landTilt, jumpDuration);

    state.jumpTimer = setTimeout(() => {
      if (state.isJumping) options.onComplete();
    }, jumpDuration * 1000 + 50);
  };

  return { stopJumpTilt, triggerJump };
};

export const handleJumpAnimationEnd = (
  event: AnimationEvent,
  state: JumpTiltState,
  onComplete: () => void
) => {
  if (event.animationName !== 'jump') return;
  if (!state.isJumping) return;
  if (state.jumpTimer) clearTimeout(state.jumpTimer);
  onComplete();
};
