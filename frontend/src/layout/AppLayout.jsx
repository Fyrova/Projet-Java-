import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, CalendarCheck, ChevronDown, ChevronUp, ClipboardList, FileText, LogOut, Menu, UserCog, X } from 'lucide-react'
import { useState } from 'react'
import { navigationResources, resourceConfigs } from '../api/resources'
import { useAuth } from '../context/AuthContext'


function initials(user) {
  const source = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.email || 'RM'
  return source.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function canSeeResource(config, user) {
  if (config.writeRole === 'Admin' && user?.role !== 'Admin') return false
  return true
}

function NavItem({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => `rm-nav-link ${isActive ? 'rm-nav-active' : ''}`}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </NavLink>
  )
}

function NavGroup({ label, icon: Icon, open, onToggle, items, onNavigate }) {
  const Chevron = open ? ChevronUp : ChevronDown
  return (
    <div>
      <button type="button" className="rm-nav-group-button" onClick={onToggle}>
        <span className="flex items-center gap-[0.85rem]">
          <Icon className="h-[18px] w-[18px]" />
          {label}
        </span>
        <Chevron className="h-4 w-4" />
      </button>
      {open && (
        <div className="rm-subnav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => (isActive ? 'rm-subnav-active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [reservationOpen, setReservationOpen] = useState(true)
  const [mineOpen, setMineOpen] = useState(true)

  const adminLinks = navigationResources
    .map((key) => ({ key, ...resourceConfigs[key], to: `/ressources/${key}` }))
    .filter((item) => canSeeResource(item, user))

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="rm-shell">
      <div className="rm-mobile-topbar">
        <button className="rm-button rm-button-secondary min-h-10 px-3" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
          <Menu className="h-5 w-5" />
        </button>
        <strong>RoomMaster</strong>
      </div>

      <aside className={`rm-sidebar ${mobileOpen ? 'rm-sidebar-open' : ''}`} aria-label="Menu principal">
        <div className="rm-sidebar-inner">
          <div className="rm-logo-container">
            <div className="rm-logo-badge">RM</div>
            <div>
              <h1 className="rm-brand-title">RoomMaster</h1>
              <p className="rm-brand-subtitle">Gestion claire des salles EDBM</p>
            </div>
            <button className="rm-mobile-close-btn" onClick={closeMobile} aria-label="Fermer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="rm-nav">
            <NavItem to="/" label="tableau de bord" icon={BarChart3} onNavigate={closeMobile} />
            <NavGroup
              label="Reservations"
              icon={CalendarCheck}
              open={reservationOpen}
              onToggle={() => setReservationOpen((value) => !value)}
              onNavigate={closeMobile}
              items={[
                { to: '/reservations-salles', label: 'Salle' },
                { to: '/seances', label: 'Seance' },
                { to: '/reservations-salles?new=1', label: 'Nouvelle reservation' },
              ]}
            />
            <NavGroup
              label="Mes reservations"
              icon={ClipboardList}
              open={mineOpen}
              onToggle={() => setMineOpen((value) => !value)}
              onNavigate={closeMobile}
              items={[
                { to: '/mes-reservations?salle', label: 'Salle' },
                { to: '/mes-reservations?seance', label: 'Seance' },
              ]}
            />
            <NavItem to="/calendriers" label="Calendriers" icon={CalendarCheck} onNavigate={closeMobile} />
            <NavItem to="/rapports" label="Rapport" icon={FileText} onNavigate={closeMobile} />
            {adminLinks.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon || UserCog} onNavigate={closeMobile} />
            ))}
          </nav>
        </div>

        <div className="rm-profile-card">
          <div className="rm-avatar">{initials(user)}</div>
          <div className="min-w-0">
            <strong className="rm-profile-name block">{`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur'}</strong>
            <span className="rm-profile-subtitle block">{user?.email || user?.role}</span>
          </div>
          <button className="rm-logout" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Deconnexion
          </button>
        </div>
      </aside>

      {mobileOpen && <button className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden" onClick={closeMobile} aria-label="Fermer le menu" />}

      <main className="rm-main">
        <Outlet />
      </main>
    </div>
  )
}
