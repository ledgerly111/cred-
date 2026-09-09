import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowDown, ArrowRight, Plus, Minus, Menu, X, Check, Download, Globe2 } from 'lucide-react';
import { navigation, titles, audiences, blueprint, differences, values, services, programmes, subjects, scholarships, scholarshipSupport, guides } from './data';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/manrope';
import './styles.css';
import './motion.css';
import './glass.css';
import './mobile.css';
import './navigation.css';
import './adaptive-header.css';
import './corrections.css';
import './blueprint-motion.css';
import WhatsAppHelper from './WhatsAppHelper';
import { DISPLAY_PHONE, WHATSAPP_NUMBER, whatsappLink, CONTACT_DESCRIPTION, FOOTER_DESCRIPTION, impactFiguresApproved, impactFigures } from './client-content';

const contactLink = (interest = '') => `#/contact${interest ? `?interest=${encodeURIComponent(interest)}` : ''}`;
function Button({ children = 'Book a Free Consultation', href = contactLink(), light = false, ...props }) { return <a className={`button ${light ? 'button-light' : ''}`} href={href} {...props}><span>{children}</span><ArrowUpRight size={22} /></a>; }
function Eyebrow({ children, number }) { return <div className="eyebrow"><span className="tiny-square" />{children}{number && <span className="eyebrow-number">{number}</span>}</div>; }
function Placeholder({ number, label, className = '' }) { return <div className={`image-placeholder ${className}`} role="img" aria-label={`Image placeholder ${number}: ${label}`}><span className="placeholder-corner">CRED / IMAGE {String(number).padStart(2, '0')}</span><span className="placeholder-number">{number}</span><span className="placeholder-caption">{label}<Plus size={16} /></span></div>; }
function observeScrollMotion(nodes) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const node = entry.target;
      if (entry.isIntersecting) {
        node.classList.add('is-visible');
      } else {
        // Reset only outside the viewport, so reversing direction never hides
        // content the reader is still looking at. Tall cards work as well.
        node.style.setProperty('--enter-y', entry.boundingClientRect.top < 0 ? '-32px' : '32px');
        node.classList.remove('is-visible');
      }
    });
  }, { threshold: 0 });
  nodes.forEach(node => observer.observe(node));
  return () => observer.disconnect();
}
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    node.querySelectorAll('h1, h2, h3, p, .eyebrow, .micro-label, .text-link').forEach((text, i) => {
      text.classList.add('motion-copy');
      text.style.setProperty('--copy-delay', `${Math.min(i, 5) * 65 + 70}ms`);
    });
    return observeScrollMotion([node]);
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ '--delay': `${delay}ms` }}>{children}</div>;
}
function SectionHead({ label, number, title, description }) { return <Reveal className="section-heading"><div><Eyebrow number={number}>{label}</Eyebrow><h2>{title}</h2></div>{description && <p>{description}</p>}</Reveal>; }
function PageBanner({ label, title, accent, description }) { return <section className="page-banner"><Reveal><h1>{title} <em>{accent}</em></h1><p>{description}</p><a className="down-link" href="#page-content" onClick={e => { e.preventDefault(); document.getElementById('page-content')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore <ArrowDown size={17} /></a></Reveal><span className="banner-orbit" aria-hidden="true" /></section>; }
function ClosingCTA({ title = 'Your next qualification should have a clear purpose.', text = 'Speak with CRED and discover a learning pathway built around your ambitions, experience and future direction.' }) { return <section className="closing-cta"><Reveal><Eyebrow>YOUR NEXT CHAPTER</Eyebrow><h2>{title}</h2><div className="closing-bottom"><p>{text}</p><Button light>Book a Free Consultation</Button></div></Reveal></section>; }
function Accordion({ items, link = false }) { const [open, setOpen] = useState(0); return <div className="accordion">{items.map(([title, text], i) => <Reveal key={title} delay={i % 3 * 50}><article className={open === i ? 'accordion-item expanded' : 'accordion-item'}><button aria-expanded={open === i} aria-controls={`panel-${i}`} onClick={() => setOpen(open === i ? -1 : i)}><span className="row-number">{String(i + 1).padStart(2, '0')}</span><h3>{title}</h3>{open === i ? <Minus size={20} /> : <Plus size={20} />}</button><div id={`panel-${i}`} className="accordion-panel" hidden={open !== i}><p>{text}</p>{link && <a className="text-link" href={contactLink(title)}>Book a Free Consultation <ArrowUpRight size={18} /></a>}</div></article></Reveal>)}</div>; }

function Hero() {
  return <section className="hero">
    <video className="hero-video" autoPlay muted loop playsInline preload="auto" aria-label="CRED Global introduction video"><source src="/cred-hero.mp4" type="video/mp4" /></video>
    <div className="hero-shade" />
    <Reveal className="hero-content">
      <h1><span>Don’t Just Choose a Course.</span><span>Choose the <em>Future</em> It Should Create.</span></h1>
      <p className="hero-summary">Career-focused guidance for degrees, professional qualifications, skills and scholarships — all connected to your future goals.</p>
      <div className="hero-actions"><Button href="#/programmes">Explore Programmes</Button></div>
    </Reveal>
  </section>;
}
function ProgrammeCard({ item }) { return <Reveal className="programme-card"><a className="programme-image-link" href={contactLink(item.title)} aria-label={`Enquire about ${item.title}`}><Placeholder number={item.id} label={item.title} /><ArrowUpRight className="card-arrow" size={24} /></a><div className="programme-copy"><span className="micro-label">{item.type.toUpperCase()} PATHWAY</span><h3><a href={contactLink(item.title)}>{item.title}</a></h3><p>{item.description}</p><a className="text-link" href={contactLink(item.title)}>Explore this pathway <ArrowUpRight size={17} /></a></div></Reveal>; }
function ScrollStatement() {
 const ref = useRef(null);
 const words = 'CRED goes beyond admissions to shape educational journeys. We connect academic qualifications, professional certifications and practical skills with clear career goals.'.split(' ');
 useEffect(() => {
   let frame;
   const update = () => {
     const rect = ref.current.getBoundingClientRect();
     const progress = Math.max(0, Math.min(1, (innerHeight * .9 - rect.top) / (rect.height * .75)));
     ref.current.querySelectorAll('.statement-word').forEach((word, i) => {
       word.style.setProperty('--word-opacity', .2 + .8 * Math.max(0, Math.min(1, progress * (words.length + 5) - i)));
     });
   };
   const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
   schedule(); window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule);
   return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
 }, []);
 return <section className="section statement-section" ref={ref}><Eyebrow>THE BIGGER PICTURE</Eyebrow><h2 className="scroll-statement" aria-label={words.join(' ')}>{words.map((word, i) => <React.Fragment key={i}><span className="statement-word" aria-hidden="true">{word}</span>{' '}</React.Fragment>)}</h2><Button href="#/services">Discover our approach</Button></section>;
}
function ImpactStatistics() {
  if (!impactFiguresApproved) return null;
  return <section className="section impact-section"><SectionHead label="CRED IN NUMBERS" title="Purposeful guidance. Real progress." /><div className="impact-grid">{impactFigures.map(([value, label]) => <Reveal key={label}><strong>{value}</strong><p>{label}</p></Reveal>)}</div></section>;
}
function BlogCards() {
  return <div className="programme-grid blog-list">{guides.map(g => <Reveal key={g.id} className="blog-card"><a href={`#/blog?article=${g.id}`} aria-label={`Read ${g.title}`}><Placeholder number={g.id} label={g.category.toLowerCase()} /></a><div className="blog-card-copy"><span className="micro-label">BLOG</span><h3><a href={`#/blog?article=${g.id}`}>{g.title}</a></h3><p>{g.body.split('. ').slice(0, 2).join('. ')}.</p><a className="text-link" href={`#/blog?article=${g.id}`}>Read more <ArrowUpRight size={18} /></a></div></Reveal>)}</div>;
}
function Home() {
  return <><Hero />
    <section className="section quick-access" aria-label="Quick access"><div className="quick-grid">{[['Find a Programme', '#/programmes'], ['Explore Scholarships', '#/scholarships'], ['Speak to an Advisor', contactLink()], ['Build My Career Blueprint', contactLink('CRED Career Blueprint')]].map(([label, href]) => <Reveal key={label}><a className="quick-card" href={href}><ArrowUpRight size={25} /><h3>{label}</h3></a></Reveal>)}</div></section>
    <section className="section intro-section" id="intro"><SectionHead label="WHAT CRED DOES" title={<>More than admission guidance.</>} /><div className="intro-grid"><Reveal><Placeholder number={1} label="A purposeful learning journey" /></Reveal><Reveal className="intro-copy"><h3>We look beyond enrolment.</h3><p>Choosing a qualification is an investment in your future. With so many universities, specialisations and professional pathways available, knowing what to study and why can be difficult.</p><p>We take time to understand your education, experience, ambitions, schedule and budget before recommending a suitable pathway.</p><p>Our goal is to help you make a learning decision with purpose.</p><a className="text-link" href="#/about">About CRED <ArrowUpRight size={20} /></a></Reveal></div></section>
    <section className="section programmes-preview"><SectionHead label="FEATURED PROGRAMMES" title={<>Your goal comes first.<br /><em>The pathway follows.</em></>} description="Explore academic, professional and practical learning connected to the future you want to create." /><div className="programme-grid">{[programmes[0], programmes[1], programmes[4]].map(item => <ProgrammeCard item={item} key={item.id} />)}</div><div className="section-footer"><Button href="#/programmes">Explore Programmes</Button></div></section>
    <section className="section blueprint-section"><SectionHead label="THE CRED CAREER BLUEPRINT" title="Your Personal Education and Career Roadmap" description="We assess your education, experience, career goals, schedule and budget before recommending a suitable academic, professional and skills-based pathway." /><div className="blueprint-grid"><Reveal className="blueprint-art"><div aria-hidden="true" className="orbit orbit-one" /><div aria-hidden="true" className="orbit orbit-two" /><div aria-hidden="true" className="orbit orbit-three" /><span className="orbit-label label-start">WHERE YOU ARE</span><span className="orbit-label label-end">WHERE YOU COULD BE</span><div className="blueprint-center">Your<br /><em>next chapter.</em><ArrowUpRight size={40} /></div></Reveal><Reveal><ol className="roadmap-list">{['Understand your current profile', 'Define your career direction', 'Select suitable qualifications', 'Identify important skills gaps', 'Build your progression plan'].map((step,i) => <li key={step}><span>0{i+1}</span><h3>{step}</h3></li>)}</ol><Button href={contactLink('CRED Career Blueprint')}>Build My Career Blueprint</Button></Reveal></div></section>
    <section className="section scholarship-preview"><SectionHead label="SCHOLARSHIP GUIDANCE" title="Scholarships for students and working professionals" description="Explore scholarships, tuition reductions and fee-support opportunities with guidance on eligibility and applications." /><Button light href="#/scholarships">Check Scholarships</Button></section>
    <ImpactStatistics />
    <section className="section difference-section"><SectionHead label="WHY CHOOSE CRED" title={<>Good guidance makes <em>all the difference.</em></>} /><div className="difference-list">{differences.map(([title, desc],i) => <Reveal key={title}><div className="difference-row"><span>0{i+1}</span><h3>{title}</h3><p>{desc}</p><ArrowUpRight size={24} /></div></Reveal>)}</div></section>
    <section className="section"><SectionHead label="BLOGS" title="Guidance for your next learning decision" /><BlogCards /></section>
    <ClosingCTA />
  </>;
}
function About() { return <><PageBanner label="ABOUT US" title="Education decisions" accent="with direction." description="We help learners understand not only what they can study, but what each learning decision can help them achieve." /><section id="page-content" className="section"><div className="intro-grid"><Reveal><Placeholder number={2} label="The people behind CRED Global" /></Reveal><Reveal className="intro-copy"><Eyebrow>WHO WE ARE</Eyebrow><h2>A clearer view<br />of your <em>future.</em></h2><p>CRED Global is a UAE-based education and career advisory supporting students and working professionals in identifying purposeful academic and professional pathways.</p><p>We believe that education should not be selected because it is popular, convenient or heavily promoted. It should be chosen because it fits the learner’s background, ambitions, circumstances and intended future.</p><p>We bring academic qualifications, professional certifications and practical development into one conversation, helping learners see the complete pathway rather than one isolated course.</p></Reveal></div></section><section className="section burgundy-section"><SectionHead label="WHY CRED WAS STARTED" title={<>Bridging the gap between<br />learning and <em>what comes next.</em></>} /><div className="story-copy"><p>CRED Global was founded after recognising a common problem: too many learners choose programmes without fully understanding how those qualifications connect to their future.</p><p>Some pursue degrees without developing the professional capabilities employers expect. Others collect certifications without a clear progression plan. Many working professionals have valuable experience but are uncertain which qualification will recognise that experience and support their next move.</p><p>CRED was created to bridge this gap. We help learners understand what to study, why it matters and how it may contribute to their long-term academic and professional development.</p></div><div className="mission-grid"><Reveal><span className="micro-label">Our Mission</span><h3>Purpose in every<br />learning decision.</h3><p>To guide students and professionals towards purposeful education by connecting academic qualifications, professional certifications and practical skills with their individual career goals.</p></Reveal><Reveal><span className="micro-label">Our Vision</span><h3>A trusted partner.<br />A world of possibility.</h3><p>To become a trusted global learning partner recognised for transforming education decisions into clear pathways for professional and personal growth.</p></Reveal></div></section><section className="section"><SectionHead label="WHAT GUIDES US" title={<>Our values.<br /><em>In every conversation.</em></>} /><Accordion items={values} /></section><section className="section first-years"><Eyebrow>OUR FIRST TWO YEARS</Eyebrow><h2>Built on meaningful<br /><em>learner relationships.</em></h2><p>During our first two years, CRED has focused on building meaningful learner relationships and helping individuals take purposeful steps towards their goals.</p></section><ImpactStatistics /><ClosingCTA title="A clear reason. A realistic pathway. A meaningful future." text="Every programme we recommend must have a clear reason, a realistic pathway and a meaningful connection to the learner’s future." /></>; }
function Services() { return <><PageBanner label="OUR SERVICES" title="Guidance for every important" accent="learning decision." description="From understanding your options to completing your enrolment, CRED gives you structured, transparent and career-focused support." /><section id="page-content" className="section service-layout"><Reveal className="service-aside"><Placeholder number={3} label="A conversation with your CRED advisor" /><p>Your journey is individual.<br />Your guidance should be, too.</p></Reveal><Accordion items={services} link /></section><section className="section burgundy-section"><SectionHead label="HOW IT WORKS" title={<>From your first question<br />to your <em>next chapter.</em></>} /><div className="steps-grid">{['Book an initial consultation.', 'Complete your profile and goal assessment.', 'Receive suitable pathway recommendations.', 'Compare your available options.', 'Apply with structured guidance.', 'Begin your programme with a clearer direction.'].map((step, i) => <Reveal key={step} delay={i % 3 * 70}><div className="step"><span>0{i + 1}</span><h3>{step}</h3><ArrowRight size={23} /></div></Reveal>)}</div><Button light>Book My Consultation</Button></section><ClosingCTA /></>; }
function Programmes() { const [filter, setFilter] = useState('All pathways'); const [subject, setSubject] = useState(''); const filtered = programmes.filter(p => filter === 'All pathways' || p.type === filter); return <><PageBanner label="PROGRAMMES" title="Built around" accent="your next step." description="Your goal comes first. Explore academic, professional and skills-based learning pathways selected to support different stages of education and career growth." /><section id="page-content" className="section"><SectionHead label="FIND YOUR DIRECTION" title={<>The right learning.<br /><em>For your ambition.</em></>} /><div className="filter-bar" role="group" aria-label="Filter programme categories">{['All pathways', 'Academic', 'Professional', 'Executive', 'Skills'].map(type => <button key={type} aria-pressed={filter === type} className={filter === type ? 'active' : ''} onClick={() => setFilter(type)}>{type}{filter === type && <ArrowUpRight size={15} />}</button>)}</div><p className="result-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'pathway' : 'pathways'} to explore</p><div className="programme-grid" key={filter}>{filtered.map(item => <ProgrammeCard item={item} key={item.id} />)}</div></section><section className="section subject-section"><SectionHead label="WHAT INTERESTS YOU?" title={<>Find your field.<br /><em>Build your future.</em></>} description="Choose a subject to include in your enquiry. An advisor will help you explore suitable options and confirm availability." /><div className="subject-list">{subjects.map(s => <button key={s} aria-pressed={subject === s} className={subject === s ? 'selected' : ''} onClick={() => setSubject(subject === s ? '' : s)}>{s}{subject === s ? <Check size={17} /> : <Plus size={17} />}</button>)}</div><Button href={contactLink(subject || 'Programme guidance')}>{subject ? 'Explore my selected subject' : 'Find a programme for my goal'}</Button></section><ClosingCTA /></>; }
function Scholarships() { return <><PageBanner label="SCHOLARSHIPS" title="Make quality education" accent="more accessible." description="Explore available scholarships, tuition reductions and fee-support opportunities with clear guidance on eligibility and application requirements." /><section id="page-content" className="section"><div className="intro-grid"><Reveal><Placeholder number={10} label="Opening doors through education" /></Reveal><Reveal className="intro-copy"><Eyebrow>SCHOLARSHIP GUIDANCE FROM CRED</Eyebrow><h2>More possibility.<br /><em>Clearer support.</em></h2><p>Funding opportunities can make education more accessible, but every award has its own conditions, deadlines and selection process. CRED helps you understand available opportunities and prepare an informed application.</p><ul className="check-list">{scholarshipSupport.map(s => <li key={s}><Check size={17} />{s}</li>)}</ul></Reveal></div></section><section className="section burgundy-section"><SectionHead label="EXPLORE FUNDING ROUTES" title={<>Support for different<br /><em>starting points.</em></>} /><Accordion items={scholarships} link /></section><ClosingCTA title="Your ambition deserves a conversation." text="Let’s explore the scholarship and fee-support opportunities that may be available for your learning pathway." /></>; }
function Blog() {
  const id = Number(new URLSearchParams(location.hash.split('?')[1] || '').get('article'));
  const article = guides.find(g => g.id === id);
  if (article) return <><PageBanner title={article.title} description={article.category.toLowerCase()} /><section id="page-content" className="section article-body"><a className="text-link" href="#/blog">← Back to Blogs</a><p>{article.body}</p><Button>Book a Free Consultation</Button></section><ClosingCTA /></>;
  return <><PageBanner title="Clear advice." accent="Confident decisions." description="Practical insights for students and professionals choosing qualifications, developing skills and planning their next step." /><section id="page-content" className="section"><SectionHead label="BLOGS" title="Make your next decision an informed one." description="Explore clear, useful guidance to help you compare options and approach your next learning decision with confidence." /><BlogCards /></section><ClosingCTA /></>;
}
function ArticleModal({ article, close }) { const ref = useRef(null); useEffect(() => { ref.current.showModal(); const previous = document.activeElement; return () => previous?.focus(); }, []); return <dialog className="article-modal" ref={ref} onCancel={close} onClick={e => e.target === ref.current && close()}><button className="modal-close" onClick={close} aria-label="Close guide"><X /></button><span className="micro-label">{article.category} / QUICK GUIDE</span><h2>{article.title}</h2><p>{article.body}</p><Button href={contactLink(article.title)} onClick={close}>Talk through your next step</Button></dialog>; }
function Contact({ interest }) {
  const [prepared, setPrepared] = useState(false);
  const [data, setData] = useState({ name: '', email: '', phone: '', profile: '', interest: interest || '', goals: '', consent: false });
  const update = e => { setPrepared(false); setData(prev => ({ ...prev, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); };
  const message = `Hello CRED! I would like to book a free consultation.

Name: ${data.name}
Email: ${data.email}
Telephone: ${data.phone || 'Not provided'}
Current stage: ${data.profile}
Interested in: ${data.interest || 'Education and career guidance'}

My goals: ${data.goals}`;
  function submit(e) { e.preventDefault(); window.open(whatsappLink(message), '_blank', 'noopener,noreferrer'); setPrepared(true); }
  return <><PageBanner title="Let’s build your" accent="learning pathway." description={CONTACT_DESCRIPTION} />
    <section id="page-content" className="section contact-grid"><Reveal className="contact-copy"><h2>Book a Free Consultation</h2><p>Complete this enquiry form and share a little about your goals. We will contact you to arrange an initial conversation.</p><a className="contact-phone" href={whatsappLink()} target="_blank" rel="noopener noreferrer"><Globe2 size={22} />WhatsApp: {DISPLAY_PHONE}</a><div className="contact-location"><Globe2 size={27} /><div>Ajman, United Arab Emirates<span>Supporting learners with a global outlook.</span></div></div></Reveal>
    <Reveal><form className="consultation-form" onSubmit={submit}><h3>Your consultation request</h3><div className="form-grid"><label>Full name <span>*</span><input required name="name" autoComplete="name" value={data.name} onChange={update} placeholder="Your full name" maxLength={120} /></label><label>Email address <span>*</span><input required type="email" name="email" autoComplete="email" value={data.email} onChange={update} placeholder="you@example.com" maxLength={200} /></label><label>Telephone / WhatsApp<input type="tel" name="phone" autoComplete="tel" value={data.phone} onChange={update} placeholder="Include your country code" maxLength={40} /></label><label>Where are you today? <span>*</span><select name="profile" required value={data.profile} onChange={update}><option value="">Select your current stage</option>{audiences.map(([a]) => <option key={a}>{a}</option>)}</select></label></div><label>I’m interested in<input name="interest" value={data.interest} onChange={update} placeholder="A qualification, subject or scholarship" maxLength={200} /></label><label>Tell us about your goals <span>*</span><textarea required name="goals" rows={4} value={data.goals} onChange={update} placeholder="What would you like your next qualification to help you achieve?" maxLength={4000} /></label><label className="checkbox-label"><input type="checkbox" name="consent" checked={data.consent} onChange={update} required /><span>I agree to share these details with CRED through WhatsApp to request a consultation.</span></label><button className="button submit-button" type="submit"><span>Book My Consultation</span><ArrowUpRight size={21} /></button><p className="form-notice">Your request opens in WhatsApp. Review the message and tap Send to contact CRED.</p>{prepared && <p className="form-success" role="status">Your request is ready to send in WhatsApp. <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">Open WhatsApp again</a></p>}</form></Reveal></section></>;
}
function Footer() { return <footer><div className="footer-columns"><div className="footer-about"><a href="#/home" className="footer-brand"><img src="/cred-logo.svg" alt="CRED Global Learning" /></a><p>{FOOTER_DESCRIPTION}</p></div><div><h3>Links</h3><nav className="footer-link-list" aria-label="Footer navigation">{navigation.map(([id,label]) => <a key={id} href={`#/${id}`}>{label}</a>)}</nav></div><div><h3>Contact</h3><a className="footer-contact-link" href={`tel:+${WHATSAPP_NUMBER}`}>Call {DISPLAY_PHONE}</a><a className="footer-contact-link" href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp {DISPLAY_PHONE}</a><p>Ajman, United Arab Emirates</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} CRED Global Learning</span><span>QUALIFICATIONS WITH A CAREER PURPOSE.</span></div></footer>; }
const wipeDirections = ['left', 'right', 'up', 'down'];
function App() {
 const [headerTheme, setHeaderTheme] = useState('dark');
 const [transitionDirection, setTransitionDirection] = useState(() => wipeDirections[Math.floor(Math.random() * wipeDirections.length)]);
 const [hash, setHash] = useState(location.hash); const [menuOpen, setMenuOpen] = useState(false); const menuButton = useRef(null); const menuPanel = useRef(null); const current = hash.replace(/^#\/?/, '').split('?')[0] || 'home'; const page = navigation.some(([id]) => id === current) ? current : 'home'; const interest = new URLSearchParams(hash.split('?')[1] || '').get('interest') || '';
 useEffect(() => { const listener = () => {
   setHash(location.hash);
   setTransitionDirection(previous => {
     const choices = wipeDirections.filter(direction => direction !== previous);
     return choices[Math.floor(Math.random() * choices.length)];
   });
 }; window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener); }, []);
 useEffect(() => { setMenuOpen(false); document.title = titles[page]; window.scrollTo(0, 0); }, [hash, page]);

 useEffect(() => {
   let frame;
   const update = () => {
     const header = document.querySelector('.top-header');
     if (!header || !header.getBoundingClientRect().height) return;
     const y = header.getBoundingClientRect().height / 2;
     const sections = [...document.querySelectorAll('main section, footer')];
     let surface = sections.find(section => { const r = section.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
     let light = false;
     while (surface) {
       const rgb = getComputedStyle(surface).backgroundColor.match(/[\d.]+/g)?.map(Number);
       if (rgb && (rgb.length < 4 || rgb[3] > .5)) { light = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > 150; break; }
       surface = surface.parentElement;
     }
     setHeaderTheme(light ? 'light' : 'dark');
   };
   const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
   schedule(); addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule);
   return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); };
 }, [hash]);
 useEffect(() => {
   const desktop = window.matchMedia('(min-width: 901px)');
   const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
   desktop.addEventListener('change', closeOnDesktop);
   return () => desktop.removeEventListener('change', closeOnDesktop);
 }, []);

 useEffect(() => {
   const textNodes = [...document.querySelectorAll('main h2, main h3, main p, main .eyebrow')].filter(node => !node.closest('.reveal, dialog, form, .statement-section'));
   textNodes.forEach(node => node.classList.add('scroll-text'));
   return observeScrollMotion(textNodes);
 }, [hash, page]);
 useEffect(() => { if (!menuOpen) return; document.body.style.overflow = 'hidden'; const focusable = () => [menuButton.current, ...menuPanel.current.querySelectorAll('a')]; focusable()[1]?.focus(); const escape = e => { if (e.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } if (e.key === 'Tab') { const nodes = focusable(); if (e.shiftKey && document.activeElement === nodes[0]) { e.preventDefault(); nodes.at(-1).focus(); } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) { e.preventDefault(); nodes[0].focus(); } } }; window.addEventListener('keydown', escape); return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', escape); }; }, [menuOpen]);
 return <><a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content').focus(); }}>Skip to content</a>
 <header className="top-header" data-theme={headerTheme}>
   <a className="top-brand" href="#/home" aria-label="CRED Global Learning home" onClick={() => setMenuOpen(false)}><img src="/cred-logo.svg" alt="CRED Global Learning" /></a>
   <nav className="top-navigation" aria-label="Main navigation">{navigation.map(([id, label]) => <a key={id} href={`#/${id}`} aria-current={page === id ? 'page' : undefined}>{label}</a>)}</nav>
   <a className="header-consultation" href="#/contact">Book a Free Consultation</a>
 </header>
 <div className="mobile-dock" aria-label="Mobile quick actions">
   <a href="#/programmes" onClick={() => setMenuOpen(false)} aria-current={page === 'programmes' ? 'page' : undefined}><Globe2 size={20} /><span>Explore</span></a>
   <button ref={menuButton} className="dock-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}<span>{menuOpen ? 'Close' : 'Menu'}</span></button>
   <a href="#/contact" onClick={() => setMenuOpen(false)} aria-current={page === 'contact' ? 'page' : undefined}><ArrowUpRight size={21} /><span>Let’s talk</span></a>
 </div>
 {menuOpen && <nav id="mobile-navigation" ref={menuPanel} className="mobile-nav" aria-label="Mobile navigation">{navigation.map(([id, label], i) => <a key={id} href={`#/${id}`} onClick={() => setMenuOpen(false)} aria-current={page === id ? 'page' : undefined}><span>0{i + 1}</span>{label}<ArrowUpRight size={23} /></a>)}<p>Qualifications with a career purpose.</p></nav>}
 <WhatsAppHelper route={hash} menuOpen={menuOpen} /><div className="site-shell" id="top"><main id="main-content" tabIndex={-1} key={hash}><span className="route-wipe" data-direction={transitionDirection} aria-hidden="true" /><a className="page-wordmark" href="#/home" aria-label="CRED Global Learning home"><img src="/cred-logo.svg" alt="CRED Global Learning" /></a>{page === 'home' ? <Home /> : page === 'about' ? <About /> : page === 'services' ? <Services /> : page === 'programmes' ? <Programmes /> : page === 'scholarships' ? <Scholarships /> : page === 'blog' ? <Blog /> : <Contact interest={interest} />}</main><Footer /></div></>;

}
createRoot(document.getElementById('root')).render(<App />);
