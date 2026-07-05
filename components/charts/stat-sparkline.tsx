"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

interface StatSparklineProps {
  points: number[];
  color: string;
  /** Stagger draw-in when multiple sparklines mount together */
  delayMs?: number;
}

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 32;
const INSET = 1;
const DRAW_DURATION_MS = 550;

function buildCoords(points: number[]): Array<[number, number]> {
  const plotWidth = VIEW_WIDTH - INSET * 2;
  const plotHeight = VIEW_HEIGHT - INSET * 2;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const step = plotWidth / (points.length - 1);

  return points.map((value, index) => {
    const x = INSET + index * step;
    const y =
      INSET + plotHeight - ((value - min) / range) * plotHeight;
    return [x, y];
  });
}

function buildLinePath(coords: Array<[number, number]>): string {
  return coords
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
}

function buildAreaPath(
  coords: Array<[number, number]>,
  baseline: number,
): string {
  if (coords.length < 2) {
    return "";
  }

  const line = buildLinePath(coords);
  const [lastX] = coords[coords.length - 1];
  const [firstX] = coords[0];

  return `${line} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
}

export function StatSparkline({
  points,
  color,
  delayMs = 0,
}: StatSparklineProps) {
  const gradientId = useId();
  const lineRef = useRef<SVGPathElement>(null);
  const [lineLength, setLineLength] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isDrawn, setIsDrawn] = useState(false);

  const hasEnoughPoints = points.length >= 2;
  const coords = hasEnoughPoints ? buildCoords(points) : [];
  const linePath = hasEnoughPoints ? buildLinePath(coords) : "";
  const areaPath = hasEnoughPoints
    ? buildAreaPath(coords, VIEW_HEIGHT - INSET)
    : "";
  const lastPoint = coords.at(-1);

  useLayoutEffect(() => {
    if (!hasEnoughPoints) {
      return;
    }

    const path = lineRef.current;
    if (!path) {
      return;
    }

    const length = path.getTotalLength();
    setLineLength(length);
    setIsReady(true);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setIsDrawn(true);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsDrawn(true);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, hasEnoughPoints, linePath]);

  if (!hasEnoughPoints || !lastPoint) {
    return null;
  }

  const [lastX, lastY] = lastPoint;

  const lineTransition = isReady
    ? `stroke-dashoffset ${DRAW_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
    : undefined;
  const areaTransition = isReady
    ? `opacity 350ms ease ${DRAW_DURATION_MS * 0.5}ms`
    : undefined;
  const dotTransition = isReady
    ? `opacity 200ms ease ${DRAW_DURATION_MS * 0.85}ms`
    : undefined;

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      className="block aspect-[100/32] w-full select-none pointer-events-none"
      aria-hidden
      overflow="visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
        style={{
          opacity: isDrawn ? 1 : 0,
          transition: areaTransition,
        }}
      />
      <path
        ref={lineRef}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: isReady ? lineLength : 1,
          strokeDashoffset: isDrawn ? 0 : isReady ? lineLength : 1,
          transition: lineTransition,
        }}
      />
      <circle
        cx={lastX}
        cy={lastY}
        r="2.5"
        fill="white"
        stroke={color}
        strokeWidth="1.5"
        style={{
          opacity: isDrawn ? 1 : 0,
          transition: dotTransition,
        }}
      />
    </svg>
  );
}
