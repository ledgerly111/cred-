"use client"

import createGlobe, { type COBEOptions } from 'cobe';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const GLOBE_CONFIG: COBEOptions = {
  width: 800, height: 800, devicePixelRatio: 2,
  phi: 4.7, theta: 0.3, dark: 0, diffuse: 0.85,
  mapSamples: 16000, mapBrightness: 2.2,
  baseColor: [0.66, 0.32, 0.40],
  markerColor: [0.98, 0.47, 0.34],
  glowColor: [0.24, 0.075, 0.13],
  markers: [],
};

export function Globe({ className, config = GLOBE_CONFIG }: { className?: string; config?: COBEOptions }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const angle = useRef(config.phi);
  const pointer = useRef<{ x: number; phi: number } | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let frame = 0;
    let lastTime = 0;
    let disposed = false;
    let globe: ReturnType<typeof createGlobe>;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    try {
      if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) throw new Error('WebGL unavailable');
      globe = createGlobe(canvas, { ...config, devicePixelRatio: dpr, width: canvas.offsetWidth * dpr, height: canvas.offsetWidth * dpr });
      globeRef.current = globe;
    } catch {
      setUnavailable(true);
      return;
    }
    function tick(time: number) {
      if (disposed) return;
      if (visible && !document.hidden) {
        if (!motion.matches && !pointer.current) angle.current += Math.min(time - lastTime, 50) * 0.00013;
        globe.update({ phi: angle.current });
      }
      lastTime = time;
      frame = requestAnimationFrame(tick);
    }
    const resize = new ResizeObserver(() => globe.update({ width: canvas.offsetWidth * dpr, height: canvas.offsetWidth * dpr }));
    resize.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(canvas);
    frame = requestAnimationFrame(tick);
    return () => { disposed = true; cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); globe.destroy(); globeRef.current = null; };
  }, [config]);

  return <div className={cn('relative mx-auto aspect-square w-full max-w-[520px]', className)}>
    {unavailable ? <div className="globe-fallback" role="img" aria-label="CRED location: Ajman, United Arab Emirates"><span>25.3934° N<br />55.4309° E</span></div> : <>
      <canvas ref={canvasRef} className="globe-canvas size-full" tabIndex={0} role="img"
        aria-label="Interactive globe. Drag or use the left and right arrow keys to rotate."
        onPointerDown={e => { if (e.pointerType === 'mouse' && e.button !== 0) return; pointer.current = { x: e.clientX, phi: angle.current }; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.style.cursor = 'grabbing'; }}
        onPointerMove={e => { if (pointer.current) angle.current = pointer.current.phi + (e.clientX - pointer.current.x) / 200; }}
        onPointerUp={e => { pointer.current = null; e.currentTarget.style.cursor = 'grab'; }}
        onPointerCancel={() => { pointer.current = null; }}
        onLostPointerCapture={() => { pointer.current = null; }}
        onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); angle.current += e.key === 'ArrowLeft' ? -0.15 : 0.15; globeRef.current?.update({ phi: angle.current }); } }} />
    </>}
  </div>;
}
