import { forwardRef, useImperativeHandle, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { MORE, PAGES } from '../data/icons.js';
import { useApp } from '../context/AppContext.jsx';

const MoreSheet = forwardRef(function MoreSheet({ items = MORE }, ref) {
  const dialogRef = useRef(null);
  const navigate = useNavigate();
  const { signOut } = useApp();

  useImperativeHandle(ref, () => ({
    open() { dialogRef.current?.showModal(); },
    close() { dialogRef.current?.close(); }
  }));

  return (
    <dialog
      ref={dialogRef}
      id="sheet"
      aria-label="More"
      onClick={e => { if (e.target === dialogRef.current) dialogRef.current.close(); }}
    >
      <div className="sheet__in">
        <h2 className="sr">More</h2>
        <nav aria-label="More">
          {items.map(p => (
            <NavLink key={p} className="navlink" to={`/app/${p}`} onClick={() => dialogRef.current?.close()}>
              <Icon name={PAGES[p][1]} />
              <span>{PAGES[p][0]}</span>
            </NavLink>
          ))}
        </nav>
        <button type="button" className="navlink" onClick={() => { dialogRef.current?.close(); signOut(); navigate('/'); }}>
          <Icon name="logout" />
          <span>Sign out</span>
        </button>
      </div>
    </dialog>
  );
});

export default MoreSheet;
