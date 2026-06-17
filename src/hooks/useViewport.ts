import { useState, useRef, useCallback } from "react";

interface ViewportOffset {
  x: number;
  y: number;
}

interface ViewportBind {
  onWheel: (e: React.WheelEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export function useViewport() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<ViewportOffset>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startOffsetRef = useRef<ViewportOffset>({ x: 0, y: 0 });

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.min(3, Math.max(0.6, prev * delta)));
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      startOffsetRef.current = { ...offset };
    },
    [offset],
  );

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;
    setOffset({
      x: startOffsetRef.current.x + dx,
      y: startOffsetRef.current.y + dy,
    });
  }, []);

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const onMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(3, prev * 1.1));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.6, prev * 0.9));
  }, []);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const bind: ViewportBind = {
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
  };

  return {
    scale,
    offset,
    bind,
    reset,
    zoomIn,
    zoomOut,
  };
}
