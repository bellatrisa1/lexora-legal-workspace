'use client';
import { useFormat } from '@/lib/queries';
import { useT } from '@/i18n/provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Layers3, Globe2, MessageSquare, Check } from 'lucide-react';
import s from './home.module.scss';

export default function Home() {
  const translate = useT();
  const format = useFormat();

  const capabilities = [
    {
      number: '01',
      icon: Layers3,
      title: translate('home.everyMatterOneClearPicture'),
      text: translate('home.bringClientsDocumentsTasksAndDecisionsTogether'),
    },
    {
      number: '02',
      icon: Globe2,
      title: translate('home.builtAroundAGlobalPerspective'),
      text: translate('home.keepJurisdictionOrganizationAndTeamContextVisible'),
    },
    {
      number: '03',
      icon: MessageSquare,
      title: translate('home.keepTheConversationConnected'),
      text: translate('home.giveEachMatterASharedConversationAnd'),
    },
  ];

  return (
    <div className={s.site}>
      <a className={s.skip} href="#main">
        {' '}
        {translate('navigation.skipToContent')}{' '}
      </a>
      <header className={s.header}>
        <Link href="/" className={s.logo} aria-label={translate('navigation.lexoraHome')}>
          <span className={s.mark} aria-hidden="true" />
          lexora<span className={s.logoDot}>.</span>
        </Link>
        <nav aria-label={translate('home.publicNavigation')}>
          <a href="#platform"> {translate('home.platform')} </a>
          <a href="#about"> {translate('navigation.aboutLexora')} </a>
          <Link href="/overview" className={s.headerAction}>
            {' '}
            {translate('home.exploreWorkspace')} <ArrowUpRight size={15} />
          </Link>
          <LanguageSwitcher />
        </nav>
      </header>
      <main id="main">
        <section className={s.hero}>
          <div className={s.heroCopy}>
            <p className={s.eyebrow}>
              <span /> GLOBAL LEGAL WORKSPACE
            </p>
            <h1>
              {' '}
              {translate('home.clarityForLegalWork')} <br />
              <span> {translate('home.acrossEveryBorder')} </span>
            </h1>
            <p className={s.intro}> {translate('home.aConnectedWorkspaceForLawFirmsInhouse')} </p>
            <div className={s.actions}>
              <Link href="/overview" className={s.primary}>
                {' '}
                {translate('home.exploreTheDemo')} <ArrowRight size={17} />
              </Link>
              <a href="#platform" className={s.textLink}>
                {' '}
                {translate('home.discoverThePlatform')} <ArrowDown />
              </a>
            </div>
            <p className={s.demoNote}>
              {' '}
              {translate('home.interactivePreviewFictionalWorkspaceNoSignup')}{' '}
            </p>
          </div>
          <div
            className={s.preview}
            aria-label={translate('home.illustrativeMatterWorkspacePreview')}
          >
            <div className={s.previewTop}>
              <span className={s.miniMark}>L</span>
              <strong>Meridian Legal</strong>
              <span className={s.previewLabel}> {translate('home.demoWorkspace')} </span>
            </div>
            <div className={s.previewBody}>
              <p className={s.eyebrow}> {translate('home.matterLex1048')} </p>
              <h2>Northstar Acquisition</h2>
              <p>
                Asteria Technologies Ltd. <span>·</span> {translate('home.englandWales')}{' '}
              </p>
              <div className={s.previewStatus}>
                <span> {translate('home.inReview')} </span>
                <small> {translate('home.corporateMa')} </small>
              </div>
              <div className={s.previewTabs}>
                <strong> {translate('navigation.overview')} </strong>
                <span> {translate('navigation.documents')} </span>
                <span> {translate('home.activity')} </span>
              </div>
              <div className={s.previewRow}>
                <span> {translate('matters.leadCounsel')} </span>
                <strong>
                  <i>OB</i> Olivia Bennett
                </strong>
              </div>
              <div className={s.previewRow}>
                <span> {translate('matters.targetDate')} </span>
                <strong>{format.date('2026-10-14', 'short')}</strong>
              </div>
              <div className={s.nextStep}>
                <span className={s.stepIcon}>
                  <Check size={16} />
                </span>
                <div>
                  <strong> {translate('home.aClearNextStep')} </strong>
                  <p> {translate('home.reviewTheTransactionDocuments')} </p>
                </div>
                <span className={s.priority}> {translate('home.highPriority')} </span>
              </div>
            </div>
            <div className={s.previewFooter}>
              <span className={s.liveDot} />{' '}
              {translate('home.connectedContextConsideredDecisions')}{' '}
            </div>
          </div>
        </section>
        <div className={s.audiences}>
          <span> {translate('home.designedAroundYourTeam')} </span>
          <p> {translate('home.lawFirms')} </p>
          <i />
          <p> {translate('home.inhouseLegal')} </p>
          <i />
          <p> {translate('home.independentCounsel')} </p>
          <i />
          <p> {translate('home.clientsCollaborators')} </p>
        </div>
        <section id="platform" className={s.platform}>
          <div className={s.sectionHeading}>
            <p className={s.eyebrow}> {translate('home.thePlatform')} </p>
            <h2>
              {' '}
              {translate('home.lessFragmentation')} <br />{' '}
              {translate('home.moreForwardMotion')}{' '}
            </h2>
            <p> {translate('home.legalWorkIsComplexEnoughTheWorkspace')} </p>
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
            <p className={s.eyebrow}> {translate('home.aboutLexora')} </p>
            <h2>
              {' '}
              {translate('home.legalExpertiseIsHuman')} <br />{' '}
              {translate('home.theWorkspaceShould')} <br /> {translate('home.workWithIt')}{' '}
            </h2>
          </div>
          <div className={s.aboutCopy}>
            <p> {translate('home.lexoraIsALegalTechnologyProductBuilt')} </p>
            <p> {translate('home.ourDirectionIsASharedWorkspaceThat')} </p>
            <p className={s.disclosure}>
              {' '}
              {translate('home.lexoraIsCurrentlyAPortfolioProductIn')}{' '}
            </p>
            <Link href="/help" className={s.textLink}>
              {' '}
              {translate('home.whatYouCanExploreToday')} <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section className={s.cta}>
          <p className={s.eyebrow}> {translate('home.seeTheWorkspaceInAction')} </p>
          <h2>
            {' '}
            {translate('home.aMoreConnectedWay')} <br />{' '}
            {translate('home.toMoveLegalWorkForward')}{' '}
          </h2>
          <Link href="/overview" className={s.primary}>
            {' '}
            {translate('home.enterTheDemoWorkspace')} <ArrowRight size={17} />
          </Link>
          <p> {translate('home.exploreMattersClientsDocumentsAndTasks')} </p>
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
          <a href="#about"> {translate('home.about')} </a>
          <Link href="/help"> {translate('home.demoGuide')} </Link>
          <Link href="/overview">
            {' '}
            {translate('navigation.workspace')} <ArrowUpRight size={13} />
          </Link>
        </div>
        <small> {translate('home.developmentPreviewAllWorkspaceRecordsAreFictional')} </small>
      </footer>
    </div>
  );
}
function ArrowDown() {
  return <span aria-hidden="true">↓</span>;
}
