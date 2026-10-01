import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Layers3, Globe2, MessageSquare, Check } from 'lucide-react';
import s from './home.module.scss';

const capabilities = [
  {
    number: '01',
    icon: Layers3,
    title: 'Every matter. One clear picture.',
    text: 'Bring clients, documents, tasks and decisions together around the work. Know who owns the next step and what needs attention.',
  },
  {
    number: '02',
    icon: Globe2,
    title: 'Built around a global perspective.',
    text: 'Keep jurisdiction, organization and team context visible. Structure cross-border work without treating one legal system as the default.',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Keep the conversation connected.',
    text: 'Give each matter a shared conversation and an activity timeline. Help legal teams and clients follow the same thread.',
  },
];

export default function Home() {
  return (
    <div className={s.site}>
      <a className={s.skip} href="#main">
        Skip to content
      </a>
      <header className={s.header}>
        <Link href="/" className={s.logo} aria-label="Lexora home">
          <span className={s.mark} aria-hidden="true" />
          lexora<span className={s.logoDot}>.</span>
        </Link>
        <nav aria-label="Public navigation">
          <a href="#platform">Platform</a>
          <a href="#about">About Lexora</a>
          <Link href="/overview" className={s.headerAction}>
            Explore workspace <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
      <main id="main">
        <section className={s.hero}>
          <div className={s.heroCopy}>
            <p className={s.eyebrow}>
              <span /> GLOBAL LEGAL WORKSPACE
            </p>
            <h1>
              Clarity for legal work.
              <br />
              <span>Across every border.</span>
            </h1>
            <p className={s.intro}>
              A connected workspace for law firms, in-house legal teams and their clients. Bring the
              details together. Keep the bigger picture in view.
            </p>
            <div className={s.actions}>
              <Link href="/overview" className={s.primary}>
                Explore the demo <ArrowRight size={17} />
              </Link>
              <a href="#platform" className={s.textLink}>
                Discover the platform <ArrowDown />
              </a>
            </div>
            <p className={s.demoNote}>
              Interactive frontend preview · Fictional workspace · No sign-up
            </p>
          </div>
          <div className={s.preview} aria-label="Illustrative matter workspace preview">
            <div className={s.previewTop}>
              <span className={s.miniMark}>L</span>
              <strong>Meridian Legal</strong>
              <span className={s.previewLabel}>DEMO WORKSPACE</span>
            </div>
            <div className={s.previewBody}>
              <p className={s.eyebrow}>MATTER / LEX-1048</p>
              <h2>Northstar Acquisition</h2>
              <p>
                Asteria Technologies Ltd. <span>·</span> England &amp; Wales
              </p>
              <div className={s.previewStatus}>
                <span>In Review</span>
                <small>Corporate / M&amp;A</small>
              </div>
              <div className={s.previewTabs}>
                <strong>Overview</strong>
                <span>Documents</span>
                <span>Activity</span>
              </div>
              <div className={s.previewRow}>
                <span>Lead counsel</span>
                <strong>
                  <i>OB</i> Olivia Bennett
                </strong>
              </div>
              <div className={s.previewRow}>
                <span>Target date</span>
                <strong>Oct 14, 2026</strong>
              </div>
              <div className={s.nextStep}>
                <span className={s.stepIcon}>
                  <Check size={16} />
                </span>
                <div>
                  <strong>A clear next step</strong>
                  <p>Review the transaction documents</p>
                </div>
                <span className={s.priority}>High priority</span>
              </div>
            </div>
            <div className={s.previewFooter}>
              <span className={s.liveDot} /> Connected context. Considered decisions.
            </div>
          </div>
        </section>
        <div className={s.audiences}>
          <span>DESIGNED AROUND YOUR TEAM</span>
          <p>Law firms</p>
          <i />
          <p>In-house legal</p>
          <i />
          <p>Independent counsel</p>
          <i />
          <p>Clients &amp; collaborators</p>
        </div>
        <section id="platform" className={s.platform}>
          <div className={s.sectionHeading}>
            <p className={s.eyebrow}>THE PLATFORM</p>
            <h2>
              Less fragmentation.
              <br />
              More forward motion.
            </h2>
            <p>
              Legal work is complex enough. The workspace around it should make the next decision
              easier.
            </p>
          </div>
          <div className={s.features}>
            {capabilities.map(({ number, icon: Icon, title, text }) => (
              <article key={number}>
                <div className={s.featureTop}>
                  <Icon size={23} strokeWidth={1.5} />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="about" className={s.about}>
          <div>
            <p className={s.eyebrow}>ABOUT LEXORA</p>
            <h2>
              Legal expertise is human.
              <br />
              The workspace should
              <br />
              work with it.
            </h2>
          </div>
          <div className={s.aboutCopy}>
            <p>
              Lexora is a legal technology product built around a simple belief: clear context helps
              people do better work.
            </p>
            <p>
              Our direction is a shared workspace that respects how legal teams operate—across
              organizations, jurisdictions and time zones. Matters sit at its center, connecting the
              people, documents and decisions behind each engagement.
            </p>
            <p className={s.disclosure}>
              Lexora is currently a portfolio product in active development. This preview
              demonstrates the frontend experience; it is not a live legal service or a production
              platform.
            </p>
            <Link href="/help" className={s.textLink}>
              What you can explore today <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section className={s.cta}>
          <p className={s.eyebrow}>SEE THE WORKSPACE IN ACTION</p>
          <h2>
            A more connected way
            <br />
            to move legal work forward.
          </h2>
          <Link href="/overview" className={s.primary}>
            Enter the demo workspace <ArrowRight size={17} />
          </Link>
          <p>Explore matters, clients, documents and tasks.</p>
        </section>
      </main>
      <footer className={s.footer}>
        <div>
          <Link href="/" className={s.logo}>
            <span className={s.mark} aria-hidden="true" />
            lexora.
          </Link>
          <p>Global Legal Workspace</p>
        </div>
        <div>
          <a href="#about">About</a>
          <Link href="/help">Demo guide</Link>
          <Link href="/overview">
            Workspace <ArrowUpRight size={13} />
          </Link>
        </div>
        <small>Frontend prototype. All workspace records are fictional.</small>
      </footer>
    </div>
  );
}
function ArrowDown() {
  return <span aria-hidden="true">↓</span>;
}
