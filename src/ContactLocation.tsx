import { Globe } from '@/components/ui/globe';
import { ArrowUpRight, MapPin } from 'lucide-react';

export const OFFICE_MAP_URL = 'https://www.google.com/maps/place/Ajman+NuVentures+Centre+Free+Zone+(ANCFZ)/@25.3940636,55.4281035,17z/data=!4m15!1m8!3m7!1s0x3e5f59db579a2c7f:0x8d2123c0bac066fe!2sAmber+Gem+Tower+-+Al+Rashidiya+3+-+Ajman!3b1!8m2!3d25.3940636!4d55.4306784!16s%2Fg%2F11yd6_tx_3!3m5!1s0x3e5f5939f85d3ac7:0x220fa8dbd75f2b54!8m2!3d25.3934422!4d55.4308613!16s%2Fg%2F11lychcgzq';

export default function ContactLocation() {
  return <section id="contact-location" className="contact-world" aria-labelledby="contact-world-title">
    <div className="world-panel">
      <div className="eyebrow"><span className="tiny-square" />BASED IN AJMAN. CONNECTED TO YOU.</div>
      <h2 id="contact-world-title">A world of possibility.<br /><em>A conversation away.</em></h2>
      <Globe />
      <p className="globe-caption"><span />Ajman, United Arab Emirates</p>
    </div>
    <div className="office-panel">
      <div className="office-heading"><MapPin size={25} /><div><h3>Find us in Ajman</h3><p>Ajman NuVentures Centre Free Zone (ANCFZ)<br />Amber Gem Tower, Al Rashidiya 3<br />Ajman, United Arab Emirates</p></div></div>
      <iframe className="office-map" title="Interactive satellite Google Map showing CRED's supplied Ajman location" src="https://maps.google.com/maps?q=25.3934422,55.4308613&z=18&t=k&output=embed" loading="eager" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      <a className="text-link" href={OFFICE_MAP_URL} target="_blank" rel="noopener noreferrer">Open location in Google Maps <ArrowUpRight size={19} /></a>
    </div>
  </section>;
}
