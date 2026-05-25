import { ViteSSG } from 'vite-ssg';
import App from './App.vue';
import { routes } from './routes';
import 'tippy.js/dist/tippy.css';

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (to.hash) {
        return { el: to.hash, behavior: 'smooth' };
      }
      if (savedPosition) {
        return savedPosition;
      }
      return { top: 0 };
    },
  },
  ({ app, router, isClient }) => {
  }
);
