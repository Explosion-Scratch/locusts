import { ref, type Ref } from 'vue';

export interface Particle<T = any> {
  id: string;
  createdAt: number;
  data: T;
}

export function useParticles<T = any>() {
  const particles: Ref<Particle<T>[]> = ref([]);

  const spawn = (data: T) => {
    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    particles.value.push({
      id,
      createdAt: Date.now(),
      data
    });
    return id;
  };

  const remove = (id: string) => {
    particles.value = particles.value.filter(p => p.id !== id);
  };

  const clear = () => {
    particles.value = [];
  };

  return {
    particles,
    spawn,
    remove,
    clear
  };
}
