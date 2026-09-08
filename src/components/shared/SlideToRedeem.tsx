"use client";

import { useRef, useState } from "react";

const HANDLE_SIZE = 52;
const COMMIT_THRESHOLD = 0.8;

export function SlideToRedeem({
  onConfirm,
  disabled = false,
  label = "Slide to redeem",
}: {
  onConfirm: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const maxDrag = () => {
    const width = trackRef.current?.getBoundingClientRect().width ?? 0;
    return Math.max(0, width - HANDLE_SIZE);
  };

  const settle = (committed: boolean) => {
    setDragging(false);
    if (committed) {
      setDragX(maxDrag());
      onConfirm();
    } else {
      setDragX(0);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - HANDLE_SIZE / 2;
    setDragX(Math.min(Math.max(x, 0), maxDrag()));
  };

  const onPointerUp = () => {
    if (!dragging) return;
    const max = maxDrag();
    settle(max > 0 && dragX / max >= COMMIT_THRESHOLD);
  };

  return (
    <div
      ref={trackRef}
      className="relative h-13 w-full touch-none select-none overflow-hidden rounded-full border border-line bg-stamp-soft"
      style={{ height: HANDLE_SIZE }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 bg-stamp/25"
        style={{ width: dragX + HANDLE_SIZE / 2 }}
      />
      <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-ink-soft">
        {disabled ? "Redeeming…" : label}
      </p>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => settle(false)}
        role="button"
        aria-label={label}
        style={{
          width: HANDLE_SIZE,
          height: HANDLE_SIZE,
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
        }}
        className="absolute left-0 top-0 flex cursor-grab items-center justify-center rounded-full bg-stamp text-lg text-surface shadow active:cursor-grabbing"
      >
        →
      </div>
    </div>
  );
}
