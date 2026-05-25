const fluidTypographyPlugin = {
  install(less, pluginManager, functions) {
    functions.add('font-size', function (emValue) {
      const em = emValue.value;
      const baseMin = 16;
      const baseMax = 20;
      const minVw = 320;
      const maxVw = 1200;

      const minPx = em * baseMin;
      const maxPx = em * baseMax;

      const slope = (maxPx - minPx) / (maxVw - minVw);
      const intercept = minPx - slope * minVw;

      const preferred = `${intercept.toFixed(4)}px + ${(slope * 100).toFixed(4)}vw`;

      return new less.tree.Anonymous(
        `clamp(${minPx.toFixed(2)}px, ${preferred}, ${maxPx.toFixed(2)}px)`
      );
    });
  }
};

export default fluidTypographyPlugin;
