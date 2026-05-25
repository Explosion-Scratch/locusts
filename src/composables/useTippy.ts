import { onBeforeUnmount, onMounted, unref, watch, type Ref } from 'vue';
import tippy, { type Instance, type Props } from 'tippy.js';

type MaybeRef<T> = T | Ref<T>;

export function useTippy(
  target: Ref<Element | null>,
  options: MaybeRef<Partial<Props>>,
) {
  let instance: Instance | null = null;

  onMounted(() => {
    const el = target.value;
    if (!el) return;

    instance = tippy(el, {
      appendTo: () => document.body,
      allowHTML: true,
      interactive: true,
      delay: [120, 80],
      duration: [160, 120],
      maxWidth: 360,
      placement: 'top',
      trigger: 'mouseenter focus click',
      hideOnClick: true,
      ...unref(options),
    });
  });

  watch(
    () => unref(options),
    (nextOptions) => {
      instance?.setProps(nextOptions);
    },
    { deep: true },
  );

  onBeforeUnmount(() => {
    instance?.destroy();
    instance = null;
  });

  return {
    get instance() {
      return instance;
    },
  };
}
