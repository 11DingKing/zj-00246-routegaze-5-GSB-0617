import { useState, useEffect, useRef } from 'react';

export function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const startValueRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = startValueRef.current;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (target - startValue) * eased;
      setValue(Math.round(current));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        startValueRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration]);

  return value;
}
