import { NavLink, Outlet } from 'react-router-dom';

const links = [
  ['/', 'Home'],
  ['/study', 'Study'],
  ['/dashboard', 'Dashboard'],
  ['/scores', 'Scores'],
  ['/settings', 'Settings'],
];

export function Layout() {
  return (
    <div className="app-shell">
      <header>
        <h1>NY P&C Flashcards</h1>
        <p className="subtitle">Adaptive exam-prep for New York Property & Casualty (original practice content).</p>
      </header>
      <main>
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
