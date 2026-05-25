const initialX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
const initialY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

export const backgroundImageController = {
  imgEl: null as HTMLImageElement | null,
  activeOwner: null as Element | null,
  frame: null as number | null,
  pos: { x: initialX, y: initialY },
  dest: { x: initialX, y: initialY },
};
