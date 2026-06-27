import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslationContext } from '../../../contexts/TranslationContext';
import { useAuthStore } from '../../../stores/authStore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubNavItem {
  path: string;
  labelKey: string;
  /** Optional hash fragment for sub-navigation within a single-page tab view (e.g., classification tabs) */
  hash?: string;
}

interface NavGroup {
  type: 'group';
  /** Label key for the group header */
  labelKey: string;
  /** Gradient classes for the group icon */
  color: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Child nav items rendered as an expandable submenu */
  children: SubNavItem[];
}

interface NavSingle {
  type: 'single';
  path: string;
  labelKey: string;
  color: string;
  icon: React.ReactNode;
}

type NavItem = NavSingle | NavGroup;

// ─── Props ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  isRtl: boolean;
}

// ─── Chevron Icon ────────────────────────────────────────────────────────────

const ChevronIcon: React.FC<{ isExpanded: boolean; isRtl: boolean }> = ({ isExpanded, isRtl }) => {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${
        isExpanded
          ? 'rotate-0'
          : isRtl
            ? 'rotate-90'
            : '-rotate-90'
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
};

// ─── Nav Items Data ──────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  // ── Overview ────────────────────────────────────────────────────────────
  {
    type: 'single',
    path: '/dashboard',
    labelKey: 'nav.dashboard',
    color: 'from-cyan-500 to-teal-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },

  // ── Staff Management ────────────────────────────────────────────────────
  {
    type: 'group',
    labelKey: 'nav.staffManagement',
    color: 'from-violet-500 to-purple-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    children: [
      { path: '/staff', labelKey: 'nav.staff' },
      { path: '/team-codes', labelKey: 'nav.teamCodes' },
      { path: '/professionals', labelKey: 'nav.professionals' },
      { path: '/educational-degrees', labelKey: 'nav.educationalDegrees' },
    ],
  },

  // ── Evaluation ──────────────────────────────────────────────────────────
  {
    type: 'group',
    labelKey: 'nav.evaluation',
    color: 'from-emerald-500 to-teal-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    children: [
      { path: '/question-categories', labelKey: 'nav.questionCategories' },
      { path: '/question-sub-categories', labelKey: 'nav.questionSubCategories' },
      { path: '/questions', labelKey: 'nav.questions' },
      { path: '/templates', labelKey: 'nav.templates' },
      { path: '/medication-evaluation-templates', labelKey: 'nav.medicationEvaluationTemplates' },
      { path: '/evaluations', labelKey: 'nav.evaluations' },
      { path: '/medication-evaluations', labelKey: 'nav.medicationEvaluations' },
      { path: '/action-plans', labelKey: 'nav.actionPlans' },
    ],
  },

  // ── Primary Health Care ────────────────────────────────────────────────
  {
    type: 'group',
    labelKey: 'nav.primaryHealthCare',
    color: 'from-orange-500 to-amber-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    children: [
      { path: '/zones', labelKey: 'nav.zones' },
      { path: '/centers', labelKey: 'nav.centers' },
      { path: '/departments', labelKey: 'nav.departments' },
      { path: '/clinic-assignments', labelKey: 'nav.clinicAssignments' },
      { path: '/medications', labelKey: 'nav.medications' },
      { path: '/phc-medications', labelKey: 'nav.phcMedications' },
    ],
  },

  // ── Classification ──────────────────────────────────────────────────────
  {
    type: 'group',
    labelKey: 'nav.classification',
    color: 'from-sky-500 to-indigo-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    children: [
      { path: '/classification', labelKey: 'classificationTabs.fields', hash: '#fields' },
      { path: '/classification', labelKey: 'classificationTabs.specialties', hash: '#specialties' },
      { path: '/classification', labelKey: 'classificationTabs.ranks', hash: '#ranks' },
      { path: '/classification', labelKey: 'classificationTabs.categories', hash: '#categories' },
      { path: '/classification', labelKey: 'classificationTabs.mappings', hash: '#mappings' },
    ],
  },

  // ── Administration ─────────────────────────────────────────────────────
  {
    type: 'group',
    labelKey: 'nav.administration',
    color: 'from-slate-500 to-slate-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { path: '/users', labelKey: 'nav.users' },
      { path: '/roles', labelKey: 'nav.roles' },
      { path: '/permissions', labelKey: 'nav.permissions' },
    ],
  },

  // ── Reports ─────────────────────────────────────────────────────────────
  {
    type: 'single',
    path: '/reports',
    labelKey: 'nav.reports',
    color: 'from-pink-500 to-rose-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Check whether any child of a nav group matches the current location.
 */
function isGroupActive(children: SubNavItem[], pathname: string, hash: string): boolean {
  return children.some((child) => {
    const childHash = child.hash ?? '';
    // If the child has a hash, match both pathname and hash exactly.
    // Otherwise, match by pathname prefix.
    if (childHash) {
      return pathname === child.path && hash === childHash;
    }
    return pathname.startsWith(child.path);
  });
}

/**
 * Check whether a sub-item matches the current location.
 */
function isSubItemActive(item: SubNavItem, pathname: string, hash: string): boolean {
  if (item.hash) {
    return pathname === item.path && hash === item.hash;
  }
  return pathname.startsWith(item.path);
}

// ─── Single Nav Item ─────────────────────────────────────────────────────────

interface SingleNavItemProps {
  item: NavSingle;
  isOpen: boolean;
  isActive: boolean;
  t: (key: string) => string;
}

const SingleNavItem: React.FC<SingleNavItemProps> = ({ item, isOpen, isActive, t }) => {
  return (
    <li>
      <Link
        to={item.path}
        className={`flex items-center rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
            : 'text-slate-300 hover:bg-white/10 hover:text-cyan-400'
        } ${isOpen ? 'px-4 py-3 gap-3' : 'justify-center px-2 py-3'}`}
      >
        <div
          className={`flex-shrink-0 ${
            isActive
              ? ''
              : `bg-gradient-to-br ${item.color} text-white p-2 rounded-lg`
          }`}
        >
          {isActive ? (
            <div className="p-2">{item.icon}</div>
          ) : (
            <div className="p-2 opacity-80 group-hover:opacity-100">{item.icon}</div>
          )}
        </div>
        {isOpen && (
          <span className="font-semibold whitespace-nowrap overflow-hidden">
            {t(item.labelKey)}
          </span>
        )}
      </Link>
    </li>
  );
};

// ─── Group Nav Item ──────────────────────────────────────────────────────────

interface GroupNavItemProps {
  item: NavGroup;
  isOpen: boolean;
  isRtl: boolean;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  t: (key: string) => string;
  pathname: string;
  hash: string;
  onHover?: () => void;
  onLeave?: () => void;
}

const GroupNavItem: React.FC<GroupNavItemProps> = ({
  item,
  isOpen,
  isRtl,
  isExpanded,
  isActive,
  onToggle,
  t,
  pathname,
  hash,
  onHover,
  onLeave,
}) => {
  return (
    <li>
      <div
        className="relative"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {/* Group Header Button */}
        <button
          type="button"
          data-nav-label={item.labelKey}
          onClick={onToggle}
          className={`w-full flex items-center rounded-xl transition-all duration-200 group ${
            isActive
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
              : 'text-slate-300 hover:bg-white/10 hover:text-cyan-400'
          } ${isOpen ? 'px-4 py-3 gap-3' : 'justify-center px-2 py-3'}`}
        >
          <div
            className={`flex-shrink-0 ${
              isActive
                ? ''
                : `bg-gradient-to-br ${item.color} text-white p-2 rounded-lg`
            }`}
          >
            {isActive ? (
              <div className="p-2">{item.icon}</div>
            ) : (
              <div className="p-2 opacity-80 group-hover:opacity-100">{item.icon}</div>
            )}
          </div>

          {isOpen && (
            <>
              <span className="flex-1 text-left font-semibold whitespace-nowrap overflow-hidden">
                {t(item.labelKey)}
              </span>
              {/* Chevron — hidden in collapsed mode */}
              <ChevronIcon isExpanded={isExpanded} isRtl={isRtl} />
            </>
          )}
        </button>

      </div>

      {/* Submenu — only visible when sidebar is open AND group is expanded */}
      {isOpen && (
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isExpanded
              ? 'grid-rows-[1fr] opacity-100 mt-1'
              : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <ul className="space-y-0.5 pl-4 pr-2 border-l-2 border-white/10 ml-5">
              {item.children.map((child) => {
                const childActive = isSubItemActive(child, pathname, hash);
                const linkTo = child.hash
                  ? `${child.path}${child.hash}`
                  : child.path;

                return (
                  <li key={`${child.path}${child.hash ?? ''}`}>
                    <Link
                      to={linkTo}
                      className={`flex items-center gap-3 rounded-lg transition-all duration-200 text-sm ${
                        childActive
                          ? 'bg-white/10 text-cyan-300 font-medium'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      } ${isOpen ? 'px-3 py-2' : 'justify-center px-2 py-2'}`}
                    >
                      {/* Active indicator dot */}
                      <span
                        className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                          childActive
                            ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="whitespace-nowrap overflow-hidden">
                        {t(child.labelKey)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
};

// ─── Section Divider ─────────────────────────────────────────────────────────

const SectionDivider: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <li className={`flex items-center transition-all duration-300 ${isOpen ? 'my-2' : 'my-1'}`}>
    <div className={`border-t border-white/10 transition-all duration-300 ${isOpen ? 'w-full mx-4' : 'w-8 mx-auto'}`} />
  </li>
);

// ─── Main Sidebar Component ──────────────────────────────────────────────────

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isRtl }) => {
  const location = useLocation();
  const { t } = useTranslationContext();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const sidebarPosition = isRtl ? 'right-0' : 'left-0';
  const pathname = location.pathname;
  const hash = location.hash;

  // Permission map: which permission is required to see each nav item
  const navItemPermissionMap: Record<string, string> = {
    'nav.users': 'users.view',
    'nav.roles': 'roles.view',
    'nav.permissions': 'permissions.view',
    'classificationTabs.fields': 'fields.view',
    'classificationTabs.specialties': 'specialties.view',
    'classificationTabs.ranks': 'ranks.view',
    'classificationTabs.categories': 'categories.view',
    'classificationTabs.mappings': 'classifications.view',
    'nav.questionCategories': 'question-categories.view',
    'nav.questionSubCategories': 'question-sub-categories.view',
    'nav.templates': 'templates.view',
    'nav.medications': 'medications.view',
    'nav.phcMedications': 'medications.view',
    'nav.medicationEvaluationTemplates': 'medication-eval-templates.view',
    'nav.medicationEvaluations': 'medication-evaluations.view',
  };

  // Track which group menus are expanded
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Track hovered group item for collapsed flyout
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [hoveredMenuRect, setHoveredMenuRect] = useState<DOMRect | null>(null);
  const flyoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleMenu = (labelKey: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(labelKey)) {
        next.delete(labelKey);
      } else {
        next.add(labelKey);
      }
      return next;
    });
  };

  return (
    <aside
      className={`fixed top-0 h-full z-50 transition-all duration-300 ease-in-out ${sidebarPosition} ${
        isOpen ? 'w-72' : 'w-20'
      }`}
    >
      <div
        className={`h-full bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 shadow-xl flex flex-col ${
          isRtl ? 'border-l' : 'border-r'
        } border-white/10`}
      >
        {/* ── Logo / Brand ──────────────────────────────────────────────── */}
        <div
          className={`flex items-center border-b border-white/20 transition-all duration-300 ${
            isOpen ? 'p-4 gap-3' : 'p-3 justify-center'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <span className="font-bold text-lg text-white whitespace-nowrap">PHC</span>
              <span className="text-sm text-slate-400 ml-1 whitespace-nowrap">Evaluation</span>
              <div className="text-xs text-slate-500 -mt-0.5">System</div>
            </div>
          )}
        </div>

        {/* ── Navigation ──────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.reduce<React.ReactNode[]>((acc, item, index) => {
              // For single items, check permission if applicable
              if (item.type === 'single') {
                const requiredPerm = navItemPermissionMap[item.labelKey];
                if (requiredPerm && !hasPermission(requiredPerm)) {
                  return acc;
                }
                const isActive = pathname.startsWith(item.path);
                acc.push(
                  <SingleNavItem
                    key={item.path}
                    item={item}
                    isOpen={isOpen}
                    isActive={isActive}
                    t={t}
                  />
                );
                return acc;
              }

              // ── Group item ── filter children by permissions
              const filteredChildren = item.children.filter((child) => {
                const requiredPerm = navItemPermissionMap[child.labelKey];
                return !requiredPerm || hasPermission(requiredPerm);
              });

              if (filteredChildren.length === 0) return acc;

              const isActive = isGroupActive(filteredChildren, pathname, hash);
              const isExpanded = expandedMenus.has(item.labelKey);

              // Create a modified item with filtered children for rendering
              const filteredItem: NavGroup = { ...item, children: filteredChildren };

              acc.push(
                <React.Fragment key={item.labelKey}>
                  {index > 0 && acc.length > 0 && (
                    <SectionDivider isOpen={isOpen} />
                  )}
                  <GroupNavItem
                    item={filteredItem}
                    isOpen={isOpen}
                    isRtl={isRtl}
                    isExpanded={isExpanded}
                    isActive={isActive}
                    onToggle={() => toggleMenu(item.labelKey)}
                    onHover={() => {
                      if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
                      setHoveredMenu(item.labelKey);
                      const el = document.querySelector(`[data-nav-label="${item.labelKey}"]`);
                      if (el) setHoveredMenuRect(el.getBoundingClientRect());
                    }}
                    onLeave={() => {
                      flyoutTimerRef.current = setTimeout(() => {
                        setHoveredMenu(null);
                        setHoveredMenuRect(null);
                      }, 200);
                    }}
                    t={t}
                    pathname={pathname}
                    hash={hash}
                  />
                </React.Fragment>
              );
              return acc;
            }, [])}
          </ul>
        </nav>

        {/* Collapsed sidebar flyout — rendered outside <nav> to avoid overflow clipping, using fixed positioning */}
        {!isOpen && hoveredMenu && hoveredMenuRect && (() => {
          const group = navItems.find(
            (i): i is NavGroup => i.type === 'group' && i.labelKey === hoveredMenu
          );
          if (!group) return null;
          // Filter children by permissions
          const filteredChildren = group.children.filter((child) => {
            const requiredPerm = navItemPermissionMap[child.labelKey];
            return !requiredPerm || hasPermission(requiredPerm);
          });
          if (filteredChildren.length === 0) return null;
          return (
            <div
              className="fixed z-[100] w-56 bg-slate-800 rounded-xl shadow-2xl border border-white/10 py-2"
              style={{
                top: `${hoveredMenuRect.top}px`,
                [isRtl ? 'right' : 'left']: isRtl
                  ? `${window.innerWidth - hoveredMenuRect.left + 8}px`
                  : `${hoveredMenuRect.right + 8}px`,
              }}
              onMouseEnter={() => {
                if (flyoutTimerRef.current) {
                  clearTimeout(flyoutTimerRef.current);
                  flyoutTimerRef.current = null;
                }
              }}
              onMouseLeave={() => {
                setHoveredMenu(null);
                setHoveredMenuRect(null);
              }}
            >
              {/* Group label header */}
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10">
                {t(group.labelKey)}
              </div>

              {/* Submenu items */}
              <div className="py-1">
                {filteredChildren.map((child) => {
                  const linkTo = child.hash
                    ? `${child.path}${child.hash}`
                    : child.path;
                  const childActive = isSubItemActive(child, pathname, hash);
                  return (
                    <Link
                      key={`${child.path}${child.hash ?? ''}`}
                      to={linkTo}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        childActive
                          ? 'bg-white/10 text-cyan-300 font-medium'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          childActive
                            ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="whitespace-nowrap">{t(child.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </aside>
  );
};
