import { createContext, useContext, useEffect, useRef } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Logo from '../../components/Logo.jsx';
import AddAppDialog from '../../components/AddAppDialog.jsx';
import MoreSheet from '../../components/MoreSheet.jsx';
import { MORE, MORE_DEVELOPER, PAGES, SIDE, SIDE_DEVELOPER, TAB } from '../../data/icons.js';
import { useApp } from '../../context/AppContext.jsx';

const AddAppDialogContext = createContext(() => {});
export const useOpenAddAppDialog = () => useContext(AddAppDialogContext);

export default function AppShell() {
  const { user, isAdmin, org, bootstrapped } = useApp();
  const location = useLocation();
  const dialogRef = useRef(null);
  const sheetRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    contentRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  if (!bootstrapped) return null;
  if (!user) return <Navigate to="/signin" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  const isOwner = user.role !== 'Developer';
  const side = isOwner ? SIDE : SIDE_DEVELOPER;
  const more = isOwner ? MORE : MORE_DEVELOPER;

  const rawPage = location.pathname.split('/')[2];
  const page = rawPage === 'assessments' ? 'assessment' : rawPage;
  const activePage = PAGES[page] ? page : 'overview';
  const title = PAGES[activePage][0];
  const isMoreActive = more.includes(activePage);
  const openAddApp = () => dialogRef.current?.open();

  return (
    <AddAppDialogContext.Provider value={openAddApp}>
      <div className="shell">
        <aside className="side">
          <NavLink className="side__brand" to="/app/overview" aria-label="SCS home">
            <Logo />
            <div className="side__brand-text">
              <span>SCS</span>
              <small>Security Compliance System</small>
            </div>
          </NavLink>
          <nav aria-label="Primary">
            {side.map(p => (
              <NavLink key={p} className="navlink" to={`/app/${p}`}>
                <Icon name={PAGES[p][1]} />
                <span>{PAGES[p][0]}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="main">
          <button className="skip" onClick={() => contentRef.current?.focus()}>Skip to content</button>
          <header className="top">
            <h1 id="page-title" tabIndex={-1}>{title}</h1>
            <div className="top__actions">
              <span className="admin-badge">{org}</span>
              <NavLink className="top__account" to="/app/account" aria-label="Account">
                <Icon name="account" size={20} />
              </NavLink>
            </div>
          </header>
          <div className="content" id="view" ref={contentRef} tabIndex={-1}>
            <Outlet />
          </div>
        </div>

        <nav className="tabbar" aria-label="Primary">
          {TAB.map(([p, label]) => (
            <NavLink key={p} to={`/app/${p}`}>
              <Icon name={PAGES[p][1]} />
              <span>{label}</span>
            </NavLink>
          ))}
          <button type="button" aria-haspopup="dialog" aria-current={isMoreActive ? 'page' : undefined} onClick={() => sheetRef.current?.open()}>
            <Icon name="more" />
            <span>More</span>
          </button>
        </nav>

        <AddAppDialog ref={dialogRef} />
        <MoreSheet ref={sheetRef} items={more} />
      </div>
    </AddAppDialogContext.Provider>
  );
}
