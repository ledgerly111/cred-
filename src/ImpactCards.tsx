import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { impactFigures } from './client-content';
import './impact-cards.css';

function ImpactCard({ value, label, index }: { value: string; label: string; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const target = parseInt(value, 10);
  const suffix = value.replace(/\d/g, '');
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let inView = false;
    const play = () => {
      cancelAnimationFrame(frame);
      if (media.matches) { setVisible(true); setCount(target); return; }
      setVisible(inView);
      setCount(0);
      if (!inView) return;
      const start = performance.now() + index * 90;
      function tick(now: number) {
        const progress = Math.max(0, Math.min(1, (now - start) / 1700));
        setCount(Math.round(target * (1 - Math.pow(1 - progress, 4))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; play(); }, { threshold: 0.18 });
    observer.observe(node);
    media.addEventListener('change', play);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); media.removeEventListener('change', play); };
  }, [target, index]);
  return <li ref={ref} className={`impact-tile impact-tile-${index + 1}${visible ? ' is-visible' : ''}`} style={{ '--tile-delay': `${index * 90}ms` } as CSSProperties}
    onPointerMove={e => {
      if (e.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      e.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 5}deg`);
      e.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`);
      e.currentTarget.style.setProperty('--shine-x', `${x * 100}%`);
      e.currentTarget.style.setProperty('--shine-y', `${y * 100}%`);
    }}
    onPointerLeave={e => { e.currentTarget.style.setProperty('--tilt-x', '0deg'); e.currentTarget.style.setProperty('--tilt-y', '0deg'); }}>
    <div className="impact-tile-face">
      <span className="impact-index" aria-hidden="true">CRED / 0{index + 1}</span>
      <span className="impact-value" aria-hidden="true">
        {String(count).padStart(String(target).length, '0').split('').map((digit, i) => <span className="impact-digit" key={i}><span className="impact-reel" style={{ transform: `translateY(-${Number(digit)}em)` }}>{Array.from({ length: 10 }, (_, n) => <span key={n}>{n}</span>)}</span></span>)}
        <span className="impact-suffix">{suffix}</span>
      </span>
      <span className="sr-only">{value} </span><span className="impact-label">{label}</span>
      <span className="impact-rule" aria-hidden="true"><i /></span>
      <svg className="impact-motif" viewBox="0 0 100 100" aria-hidden="true"><path d="M10 90V50a40 40 0 0 1 80 0v40M25 90V50a25 25 0 0 1 50 0v40M40 90V50a10 10 0 0 1 20 0v40" /></svg>
    </div>
  </li>;
}

export default function ImpactCards() {
  return <ul className="impact-cards" aria-label="CRED in numbers">{impactFigures.map(([value, label], index) => <ImpactCard key={value} value={value} label={label} index={index} />)}</ul>;
}
