import { ref } from "vue";

export interface UseHoldActionOptions {
  duration?: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function useHoldAction(options: UseHoldActionOptions = {}) {
  const { duration = 1000, onComplete, onCancel } = options;

  const isHolding = ref(false);
  const progress = ref(0);

  let startTime = 0;
  let animationFrame: number | null = null;

  function updateProgress() {
    const elapsed = Date.now() - startTime;
    progress.value = Math.min(elapsed / duration, 1);

    if (progress.value >= 1) {
      complete();
    } else {
      animationFrame = requestAnimationFrame(updateProgress);
    }
  }

  function start() {
    isHolding.value = true;
    progress.value = 0;
    startTime = Date.now();
    animationFrame = requestAnimationFrame(updateProgress);
  }

  function cancel() {
    isHolding.value = false;
    progress.value = 0;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    onCancel?.();
  }

  function complete() {
    isHolding.value = false;
    progress.value = 1;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    onComplete?.();
  }

  return {
    isHolding,
    progress,
    start,
    cancel,
  };
}
