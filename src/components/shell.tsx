'use client';
import Link from 'next/link';
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
  const path = usePathname();
  const router = useRouter();
  const { session, setDemoUser } = useWorkspaceContext();
  const { data } = useWorkspace();
  const section = [...mainNavigation, ...secondaryNavigation].find((item) =>
    item.href === '/' ? path === '/' : path.startsWith(item.href),
  );
  const roleSelect = (
    <label>
      Demo view
      <select
        aria-label="Demo role"
        value={session.userId}
        onChange={(e) => setDemoUser(e.target.value)}
      >
        {demoIdentities.map((identity) => (
          <option key={identity.id} value={identity.id}>
            {identity.label}
          </option>
        ))}
      </select>
    </label>
  );
  const links = (items: typeof mainNavigation) =>
    items.map(({ href, label, icon: Icon }) => (
      <Link key={href} href={href} aria-current={section?.href === href ? 'page' : undefined}>
        <Icon size={16} />
        {label}
      </Link>
    ));
  return (
    <div className={s.shell}>
      <a className={s.skip} href="#main">
        Skip to content
      </a>
      <aside className={s.sidebar}>
        <Link href="/" className={s.brand} aria-label="Lexora home">
          <span className={s.mark} />
          <span className={s.wordmark}>
            lexora<small>Global Legal Workspace</small>
          </span>
        </Link>
        <Link href="/settings" className={s.organization}>
          <span className={s.orgMark}>{data?.organization.initials ?? 'ML'}</span>
          <span>
            <strong>{data?.organization.name ?? 'Workspace'}</strong>
            <small>Organization workspace</small>
          </span>
          <ChevronDown size={13} className={s.orgArrow} />
        </Link>
        <p className={s.navLabel}>WORKSPACE</p>
        <nav className={s.nav} aria-label="Main navigation">
          {links(mainNavigation)}
        </nav>
        <div className={s.navBottom}>
          <nav className={s.nav} aria-label="Workspace settings">
            {links(secondaryNavigation)}
          </nav>
          <div className={s.demo}>
            {roleSelect}
            <p>Demo workspace · changes reset on reload</p>
          </div>
          <Link href="/settings" className={s.profile}>
            <Avatar
              name={data?.currentUser.name ?? 'Workspace user'}
              initials={data?.currentUser.initials}
            />
            <span>
              {data?.currentUser.name ?? 'Loading profile…'}
              <small>{data?.currentUser.role ?? 'Demo mode'}</small>
            </span>
          </Link>
        </div>
      </aside>
      <div className={s.mainWrap}>
        <header className={s.topbar}>
          <div className={s.mobileButton}>
            <Dialog title="Navigation" trigger={<Menu size={19} />}>
              <>
                <nav className={s.mobileNav} aria-label="Mobile navigation">
                  {links([...mainNavigation, ...secondaryNavigation])}
                  <Link href="/">About Lexora</Link>
                </nav>
                <div className={s.mobileDemo}>
                  {roleSelect}
                  <p className={ui.small}>Demo mode · no real authorization</p>
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
              aria-label="Global search"
              placeholder="Search matters, clients, documents…"
            />
            <kbd>Search ↵</kbd>
          </form>
          <div className={s.tools}>
            <Link href="/matters/new" className={ui.button}>
              <Plus size={14} />
              New Matter
            </Link>
            <LanguageSwitcher />
            <Dialog title="Workspace updates" trigger={<Bell size={17} />}>
              {data ? (
                <>
                  <p className={ui.notice}>
                    Recent demo activity. Live notifications are not connected.
                  </p>
                  <ActivityFeed data={data} limit={5} />
                </>
              ) : (
                <p className={ui.body}>Updates are unavailable while the workspace loads.</p>
              )}
            </Dialog>
            <Dialog
              title="Your workspace profile"
              trigger={
                <Avatar
                  name={data?.currentUser.name ?? 'User'}
                  initials={data?.currentUser.initials}
                />
              }
              className={s.topAvatar}
            >
              <div className={s.userLinks}>
                <strong>{data?.currentUser.name}</strong>
                <span className={ui.muted}>{data?.currentUser.email}</span>
                <Link href="/settings">Workspace settings →</Link>
                <span className={ui.small}>
                  Demonstration identity. Authentication is not connected.
                </span>
              </div>
            </Dialog>
          </div>
        </header>
        <main id="main" className={s.main}>
          <div className={s.breadcrumb}>
            <span>Workspace</span>
            <ChevronRight size={10} />
            <span>{section?.label ?? 'Search'}</span>
            {path.startsWith('/matters/') && (
              <>
                <ChevronRight size={10} />
                <span>{path.endsWith('/new') ? 'New matter' : 'Matter details'}</span>
              </>
            )}
          </div>
          {children}
        </main>
        <footer className={s.footer}>
          <span>Lexora · Global Legal Workspace</span>
          <span className={s.workspaceStatus}>Demo environment · Fictional data</span>
        </footer>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return path === '/' ? <>{children}</> : <WorkspaceShell>{children}</WorkspaceShell>;
}
