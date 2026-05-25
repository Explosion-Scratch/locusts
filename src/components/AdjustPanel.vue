<template>
  <div class="adjust-panel-wrapper">
    <button
      class="adjust-panel-toggle"
      @click="togglePanel"
      :aria-expanded="isOpen"
      aria-label="Customize typography"
    >
      <svg
        v-if="!isOpen"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 256 256"
      >
        <path
          fill="currentColor"
          d="M128 80a48 48 0 1 0 48 48a48.05 48.05 0 0 0-48-48m0 80a32 32 0 1 1 32-32a32 32 0 0 1-32 32m112.54-52.48l-23.36-7.85a97.66 97.66 0 0 0-6.1-14.73l12.72-21.28a8 8 0 0 0-1.39-9.67l-18.77-18.77a8 8 0 0 0-9.67-1.39l-21.28 12.72a97.66 97.66 0 0 0-14.73-6.1L148.48 15.4a8 8 0 0 0-7.94-6.4h-26.56a8 8 0 0 0-7.94 6.4L98.19 38.76a97.66 97.66 0 0 0-14.73 6.1L62.18 32.14a8 8 0 0 0-9.67 1.39L33.74 52.3a8 8 0 0 0-1.39 9.67l12.72 21.28a97.66 97.66 0 0 0-6.1 14.73l-23.36 7.85a8 8 0 0 0-6.4 7.94v26.56a8 8 0 0 0 6.4 7.94l23.36 7.85a97.66 97.66 0 0 0 6.1 14.73l-12.72 21.28a8 8 0 0 0 1.39 9.67l18.77 18.77a8 8 0 0 0 9.67 1.39l21.28-12.72a97.66 97.66 0 0 0 14.73 6.1l7.85 23.36a8 8 0 0 0 7.94 6.4h26.56a8 8 0 0 0 7.94-6.4l7.85-23.36a97.66 97.66 0 0 0 14.73-6.1l21.28 12.72a8 8 0 0 0 9.67-1.39l18.77-18.77a8 8 0 0 0 1.39-9.67l-12.72-21.28a97.66 97.66 0 0 0 6.1-14.73l23.36-7.85a8 8 0 0 0 6.4-7.94v-26.56a8 8 0 0 0-6.4-7.94M224 136.6l-20.12 6.76a8 8 0 0 0-5.18 5.76a82 82 0 0 1-10.74 25.86a8 8 0 0 0 .74 9.58l11 18.33l-7.53 7.53l-18.33-11a8 8 0 0 0-9.58-.74a82 82 0 0 1-25.86 10.74a8 8 0 0 0-5.76 5.18L132.6 224h-10.65l-6.76-20.12a8 8 0 0 0-5.76-5.18a82 82 0 0 1-25.86-10.74a8 8 0 0 0-9.58.74l-18.33 11l-7.53-7.53l11-18.33a8 8 0 0 0-.74-9.58a82 82 0 0 1-10.74-25.86a8 8 0 0 0-5.18-5.76L16 132.6v-10.65l20.12-6.76a8 8 0 0 0 5.18-5.76A82 82 0 0 1 52 83.57a8 8 0 0 0-.74-9.58l-11-18.33l7.53-7.53l18.33 11a8 8 0 0 0 9.58.74A82 82 0 0 1 116.3 49a8 8 0 0 0 5.76-5.18L128.8 24h10.65l6.76 20.12a8 8 0 0 0 5.76 5.18a82 82 0 0 1 25.86 10.74a8 8 0 0 0 9.58-.74l18.33-11l7.53 7.53l-11 18.33a8 8 0 0 0 .74 9.58a82 82 0 0 1 10.74 25.86a8 8 0 0 0 5.18 5.76L224 122v10.65Z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 256 256"
      >
        <path
          fill="currentColor"
          d="M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z"
        />
      </svg>
    </button>

    <Transition name="panel-slide">
      <div v-if="isOpen" class="adjust-panel">
        <h3 class="adjust-panel__title">Adjust Typography</h3>

        <div class="adjust-panel__sections">
          <div class="adjust-panel__section">
            <h4 class="adjust-panel__section-title">Body Text</h4>
            
            <div class="adjust-panel__field">
              <label>Font Family</label>
              <select v-model="bodyFont">
                <option value="'New Computer Modern', Georgia, serif">Computer Modern (Serif)</option>
                <option value="'EB Garamond', Georgia, serif">EB Garamond (Serif)</option>
                <option value="'Fraunces', Georgia, serif">Fraunces (Display)</option>
                <option value="system-ui, -apple-system, sans-serif">System (Sans-Serif)</option>
              </select>
            </div>

            <div class="adjust-panel__field">
              <div class="adjust-panel__field-header">
                <label>Font Size</label>
                <span>{{ bodySize }}px</span>
              </div>
              <input
                type="range"
                v-model.number="bodySize"
                min="13"
                max="26"
                step="1"
              />
            </div>

            <div class="adjust-panel__field">
              <div class="adjust-panel__field-header">
                <label>Line Height</label>
                <span>{{ bodyLineHeight }}</span>
              </div>
              <input
                type="range"
                v-model.number="bodyLineHeight"
                min="1.3"
                max="2.3"
                step="0.05"
              />
            </div>
          </div>

          <div class="adjust-panel__section">
            <h4 class="adjust-panel__section-title">Headings</h4>

            <div class="adjust-panel__field">
              <label>Font Family</label>
              <select v-model="headingsFont">
                <option value="'New Computer Modern', Georgia, serif">Computer Modern (Serif)</option>
                <option value="'EB Garamond', Georgia, serif">EB Garamond (Serif)</option>
                <option value="'Fraunces', Georgia, serif">Fraunces (Display)</option>
                <option value="system-ui, -apple-system, sans-serif">System (Sans-Serif)</option>
              </select>
            </div>

            <div class="adjust-panel__field">
              <label>Font Weight</label>
              <select v-model="headingsWeight">
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
              </select>
            </div>

            <div class="adjust-panel__field">
              <div class="adjust-panel__field-header">
                <label>Line Height</label>
                <span>{{ headingsLineHeight }}</span>
              </div>
              <input
                type="range"
                v-model.number="headingsLineHeight"
                min="1.0"
                max="1.8"
                step="0.05"
              />
            </div>

            <div class="adjust-panel__field-row">
              <div class="adjust-panel__field">
                <div class="adjust-panel__field-header">
                  <label>H1 Size</label>
                  <span>{{ h1Size }}em</span>
                </div>
                <input
                  type="range"
                  v-model.number="h1Size"
                  min="1.5"
                  max="3.2"
                  step="0.05"
                />
              </div>

              <div class="adjust-panel__field">
                <div class="adjust-panel__field-header">
                  <label>H2 Size</label>
                  <span>{{ h2Size }}em</span>
                </div>
                <input
                  type="range"
                  v-model.number="h2Size"
                  min="1.1"
                  max="2.5"
                  step="0.05"
                />
              </div>

              <div class="adjust-panel__field">
                <div class="adjust-panel__field-header">
                  <label>H3 Size</label>
                  <span>{{ h3Size }}em</span>
                </div>
                <input
                  type="range"
                  v-model.number="h3Size"
                  min="0.9"
                  max="2.0"
                  step="0.05"
                />
              </div>
            </div>
          </div>
        </div>

        <button class="adjust-panel__reset" @click="resetDefaults">
          Reset Defaults
        </button>
      </div>
    </Transition>

    <component :is="'style'" v-text="generatedCss" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const isOpen = ref(false);

const bodyFont = ref("'New Computer Modern', Georgia, serif");
const bodySize = ref(17);
const bodyLineHeight = ref(1.72);

const headingsFont = ref("'New Computer Modern', Georgia, serif");
const headingsWeight = ref("700");
const headingsLineHeight = ref(1.25);
const h1Size = ref(2.0);
const h2Size = ref(1.35);
const h3Size = ref(1.1);

function togglePanel() {
  isOpen.value = !isOpen.value;
}

function resetDefaults() {
  bodyFont.value = "'New Computer Modern', Georgia, serif";
  bodySize.value = 17;
  bodyLineHeight.value = 1.72;

  headingsFont.value = "'New Computer Modern', Georgia, serif";
  headingsWeight.value = "700";
  headingsLineHeight.value = 1.25;
  h1Size.value = 2.0;
  h2Size.value = 1.35;
  h3Size.value = 1.1;
}

const generatedCss = computed(() => {
  return `
    .article-body,
    .article-content {
      font-family: ${bodyFont.value} !important;
      font-size: ${bodySize.value}px !important;
      line-height: ${bodyLineHeight.value} !important;
    }
    .article-body p,
    .article-content p,
    .article-body li,
    .article-content li {
      font-size: ${bodySize.value}px !important;
      line-height: ${bodyLineHeight.value} !important;
    }
    .article-body h1,
    .article-content h1 {
      font-family: ${headingsFont.value} !important;
      font-size: ${h1Size.value}em !important;
      line-height: ${headingsLineHeight.value} !important;
      font-weight: ${headingsWeight.value} !important;
    }
    .article-body h2,
    .article-content h2 {
      font-family: ${headingsFont.value} !important;
      font-size: ${h2Size.value}em !important;
      line-height: ${headingsLineHeight.value} !important;
      font-weight: ${headingsWeight.value} !important;
    }
    .article-body h3,
    .article-content h3 {
      font-family: ${headingsFont.value} !important;
      font-size: ${h3Size.value}em !important;
      line-height: ${headingsLineHeight.value} !important;
      font-weight: ${headingsWeight.value} !important;
    }
  `;
});
</script>

<style lang="less" scoped>
.adjust-panel-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  font-family: system-ui, -apple-system, sans-serif;
  color: #1a1a1a;
  
  @media print {
    display: none !important;
  }
}

.adjust-panel-toggle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a4a4a;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color @transition-fast, color @transition-fast;
  
  &:hover {
    background: #fff;
    color: @accent;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.adjust-panel {
  position: absolute;
  bottom: 64px;
  right: 0;
  width: 320px;
  max-width: 90vw;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  box-shadow: 0 16px 48px rgba(35, 28, 18, 0.12);
  padding: 1.25em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  transform-origin: bottom right;
}

.adjust-panel__title {
  font-size: 0.95em;
  font-weight: 700;
  margin: 0;
  padding-bottom: 0.5em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #333;
}

.adjust-panel__sections {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 4px;
}

.adjust-panel__section {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}

.adjust-panel__section-title {
  font-size: 0.82em;
  font-weight: 700;
  color: @accent;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0;
}

.adjust-panel__field {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  
  label {
    font-size: 0.78em;
    font-weight: 600;
    color: #555;
  }
  
  select {
    width: 100%;
    padding: 0.45em 0.6em;
    font-size: 0.82em;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: #fff;
    outline: none;
    color: #333;
    cursor: pointer;
    
    &:focus {
      border-color: @accent;
    }
  }
  
  input[type="range"] {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.08);
    outline: none;
    accent-color: @accent;
    cursor: pointer;
  }
}

.adjust-panel__field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-size: 0.76em;
    font-weight: 600;
    color: @accent;
  }
}

.adjust-panel__field-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5em;
}

.adjust-panel__reset {
  margin-top: 0.25em;
  padding: 0.55em;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: transparent;
  font-size: 0.8em;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: background @transition-fast, color @transition-fast;
  
  &:hover {
    background: rgba(0, 0, 0, 0.03);
    color: #333;
  }
}

/* Slide Transition */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(12px);
}
</style>
