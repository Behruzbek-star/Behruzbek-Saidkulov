import { Link, NavLink } from 'react-router-dom';

const navItems = [
  ['/', 'Home'],
  ['/study', 'Study'],
  ['/dashboard', 'Dashboard'],
  ['/settings', 'Settings'],
];

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="app-shell">
    <header>
      <Link to="/" className="brand">Behruzbek's StudyTool</Link>
      <small>Exam-style practice only (not official questions)</small>
    </header>
    <main>{children}</main>
    <nav>
      {navItems.map(([to, label]) => (
        <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
          {label}
        </NavLink>
      ))}
    </nav>
  </div>
);
