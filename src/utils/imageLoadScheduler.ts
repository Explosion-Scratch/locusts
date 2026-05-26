let paintLoadsScheduled = false;
let paintLoadsDone = false;
const listeners = new Set<() => void>();

function flushPaintLoads() {
  if (paintLoadsDone) return;
  paintLoadsDone = true;
  listeners.forEach((listener) => listener());
  listeners.clear();
}

export function scheduleImageLoadsAfterPaint() {
  if (paintLoadsDone) return;
  if (paintLoadsScheduled) return;
  paintLoadsScheduled = true;

  const runAfterPaint = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(flushPaintLoads);
    });
  };

  if (document.readyState === "complete") {
    runAfterPaint();
    return;
  }

  window.addEventListener("load", runAfterPaint, { once: true });
}

export function flushImageLoadsNow() {
  flushPaintLoads();
}

export function onImageLoadsAfterPaint(listener: () => void) {
  if (paintLoadsDone) {
    listener();
    return () => {};
  }

  listeners.add(listener);
  scheduleImageLoadsAfterPaint();
  return () => listeners.delete(listener);
}
