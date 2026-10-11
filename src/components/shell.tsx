'use client';
import { useT } from '@/i18n/provider';

import Link from 'next/link';
import { isRestMode } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Plus, Bell, ChevronDown, Menu, ChevronRight } from 'lucide-react';
import { useWorkspaceContext } from './providers';
import { useWorkspace } from '@/lib/queries';
import { demoIdentities } from '@/lib/demo';
import { Avatar } from './common';
import { Dialog } from './dialog';
import { mainNavigation, secondaryNavigation } from './navigation';
import { ActivityFeed } from './workspace/activity-feed';
import { LanguageSwitcher } from './language-switcher';
import s from './shell.module.scss';
import ui from './ui.module.scss';
function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const translate = useT();

  const path = usePathname();
  const router = useRouter();
  const { session, setDemoUser } = useWorkspaceContext();
  const { data } = useWorkspace();
  const section = [...mainNavigation, ...secondaryNavigation].find((item) =>
    item.href === '/' ? path === '/' : path.startsWith(item.href),
  );
  const roleSelect = (
    <label>
      {' '}
      {translate('navigation.demoView')}{' '}
      <select
        aria-label={translate('navigation.demoRole')}
        value={session.userId}
        onChange={(e) => setDemoUser(e.target.value)}
      >
        {demoIdentities.map((identity) => (
          <option key={identity.id} value={identity.id}>
            {translate(identity.label)}
          </option>
        ))}
      </select>
    </label>
  );
  const links = (items: typeof mainNavigation) =>
    items.map(({ href, label, icon: Icon }) => (
      <Link key={href} href={href} aria-current={section?.href === href ? 'page' : undefined}>
        <Icon size={16} />
        {translate(label)}
      </Link>
    ));
  return (
    <div className={s.shell}>
      <a className={s.skip} href="#main">
        {' '}
        {translate('navigation.skipToContent')}{' '}
      </a>
      <aside className={s.sidebar}>
        <Link href="/" className={s.brand} aria-label={translate('navigation.lexoraHome')}>
          <span className={s.mark} />
          <span className={s.wordmark}>
            lexora<small>Global Legal Workspace</small>
          </span>
        </Link>
        <Link href="/settings" className={s.organization}>
          <span className={s.orgMark}>{data?.organization.initials ?? 'ML'}</span>
          <span>
            <strong>{data?.organization.name ?? translate('navigation.workspace')}</strong>
            <small> {translate('navigation.organizationWorkspace')} </small>
          </span>
          <ChevronDown size={13} className={s.orgArrow} />
        </Link>
        <p className={s.navLabel}> {translate('navigation.workspace2')} </p>
        <nav className={s.nav} aria-label={translate('navigation.mainNavigation')}>
          {links(mainNavigation)}
        </nav>
        <div className={s.navBottom}>
          <nav className={s.nav} aria-label={translate('navigation.workspaceSettings')}>
            {links(secondaryNavigation)}
          </nav>
          <div className={s.demo}>
            {roleSelect}
            <p>
              {isRestMode
                ? translate('navigation.demoApiPostgresqlStorage')
                : translate('navigation.demoWorkspaceChangesResetOnReload')}
            </p>
          </div>
          <Link href="/settings" className={s.profile}>
            <Avatar
              name={data?.currentUser.name ?? translate('navigation.workspaceUser')}
              initials={data?.currentUser.initials}
            />
            <span>
              {data?.currentUser.name ?? translate('navigation.loadingProfile')}
              <small>
                {data
                  ? translate(
                      (
                        {
                          client: 'matters.client',
                          lawyer: 'roles.lawyer',
                          admin: 'roles.admin',
                          paralegal: 'roles.paralegal',
                          manager: 'roles.manager',
                        } as const
                      )[data.currentUser.role],
                    )
                  : translate('navigation.demoMode')}
              </small>
            </span>
          </Link>
        </div>
      </aside>
      <div className={s.mainWrap}>
        <header className={s.topbar}>
          <div className={s.mobileButton}>
            <Dialog title={translate('navigation.navigation')} trigger={<Menu size={19} />}>
              <>
                <nav className={s.mobileNav} aria-label={translate('navigation.mobileNavigation')}>
                  {links([...mainNavigation, ...secondaryNavigation])}
                  <Link href="/"> {translate('navigation.aboutLexora')} </Link>
                </nav>
                <div className={s.mobileDemo}>
                  {roleSelect}
                  <p className={ui.small}>
                    {' '}
                    {translate('navigation.demoModeNoRealAuthorization')}{' '}
                  </p>
                </div>
              </>
            </Dialog>
          </div>
          <form
            className={s.search}
            action="/search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const term = String(new FormData(e.currentTarget).get('q') ?? '');
              router.push(`/search?q=${encodeURIComponent(term)}`);
            }}
          >
            <Search size={16} />
            <input
              type="search"
              name="q"
              aria-label={translate('navigation.globalSearch')}
              placeholder={translate('navigation.searchMattersClientsDocuments')}
            />
            <kbd> {translate('navigation.search')} </kbd>
          </form>
          <div className={s.tools}>
            <Link href="/matters/new" className={ui.button}>
              <Plus size={14} /> {translate('navigation.newMatter')}{' '}
            </Link>
            <LanguageSwitcher />
            <Dialog title={translate('navigation.workspaceUpdates')} trigger={<Bell size={17} />}>
              {data ? (
                <>
                  <p className={ui.notice}>
                    {' '}
                    {translate('navigation.recentDemoActivityLiveNotificationsAreNot')}{' '}
                  </p>
                  <ActivityFeed data={data} limit={5} />
                </>
              ) : (
                <p className={ui.body}>
                  {' '}
                  {translate('navigation.updatesAreUnavailableWhileTheWorkspaceLoads')}{' '}
                </p>
              )}
            </Dialog>
            <Dialog
              title={translate('navigation.yourWorkspaceProfile')}
              trigger={
                <Avatar
                  name={data?.currentUser.name ?? translate('navigation.user')}
                  initials={data?.currentUser.initials}
                />
              }
              className={s.topAvatar}
            >
              <div className={s.userLinks}>
                <strong>{data?.currentUser.name}</strong>
                <span className={ui.muted}>{data?.currentUser.email}</span>
                <Link href="/settings"> {translate('navigation.workspaceSettings2')} </Link>
                <span className={ui.small}>
                  {' '}
                  {translate('navigation.demonstrationIdentityAuthenticationIsNotConnected')}{' '}
                </span>
              </div>
            </Dialog>
          </div>
        </header>
        <main id="main" className={s.main}>
          <div className={s.breadcrumb}>
            <span> {translate('navigation.workspace')} </span>
            <ChevronRight size={10} />
            <span>{section ? translate(section.label) : translate('navigation.search2')}</span>
            {path.startsWith('/matters/') && (
              <>
                <ChevronRight size={10} />
                <span>
                  {path.endsWith('/new')
                    ? translate('navigation.newMatter2')
                    : translate('matters.matterDetails')}
                </span>
              </>
            )}
          </div>
          {children}
        </main>
        <footer className={s.footer}>
          <span>Lexora · Global Legal Workspace</span>
          <span className={s.workspaceStatus}>
            {' '}
            {translate('navigation.demoEnvironmentFictionalData')}{' '}
          </span>
        </footer>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return path === '/' ? <>{children}</> : <WorkspaceShell>{children}</WorkspaceShell>;
}
