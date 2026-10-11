import { Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT_EMAIL, DISPLAY_PHONE, OFFICE_ADDRESS, WHATSAPP_NUMBER, whatsappLink } from './client-content';
import { OFFICE_MAP_URL } from './ContactLocation';
import './contact-details.css';

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.91 11.91 0 0 0 12.04 0C5.46 0 .1 5.35.1 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.26-1.64a11.94 11.94 0 0 0 5.78 1.47h.01c6.58 0 11.94-5.35 11.95-11.93a11.86 11.86 0 0 0-3.48-8.42ZM12.05 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.97.99-3.63-.24-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.46 4.44-9.9 9.9-9.9a9.84 9.84 0 0 1 7 2.9 9.84 9.84 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.06 4.47.71.3 1.27.49 1.7.62.71.22 1.36.19 1.87.11.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" /></svg>;
}

export default function ContactDetails({ footer = false }) {
  return <address className={`contact-details${footer ? ' contact-details-footer' : ''}`}>
    <a href={`tel:+${WHATSAPP_NUMBER}`} aria-label={`Call CRED on ${DISPLAY_PHONE}`}><Phone aria-hidden="true" /><span>{DISPLAY_PHONE}</span></a>
    <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp CRED on ${DISPLAY_PHONE}`}><WhatsAppIcon /><span>{DISPLAY_PHONE}</span></a>
    <a href={`mailto:${CONTACT_EMAIL}`} aria-label={`Email CRED at ${CONTACT_EMAIL}`}><Mail aria-hidden="true" /><span>{CONTACT_EMAIL}</span></a>
    <a href={OFFICE_MAP_URL} target="_blank" rel="noopener noreferrer" aria-label={`View CRED office on Google Maps: ${OFFICE_ADDRESS.join(', ')}`}><MapPin aria-hidden="true" /><span>{OFFICE_ADDRESS.map(line => <span className="contact-address-line" key={line}>{line}</span>)}</span></a>
  </address>;
}
