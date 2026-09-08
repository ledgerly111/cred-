import { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from './client-content';

export default function WhatsAppHelper({ route, menuOpen }) {
  const [scrolling, setScrolling] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setScrolling(false), 750);
    };
    // Capture also covers scrolling inside an expanded mobile menu or dialog.
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => { window.removeEventListener('scroll', onScroll, true); clearTimeout(timer.current); };
  }, []);
  useEffect(() => { clearTimeout(timer.current); setScrolling(false); }, [route]);
  const hidden = scrolling || menuOpen;
  return <a className={`whatsapp-helper${hidden ? ' is-scrolling' : ''}`} href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="Need guidance? Speak to CRED on WhatsApp" aria-hidden={hidden} tabIndex={hidden ? -1 : 0}>
    <MessageCircle size={27} aria-hidden="true" />
    <span><strong>Need guidance?</strong><span>Speak to CRED</span></span>
  </a>;
}
