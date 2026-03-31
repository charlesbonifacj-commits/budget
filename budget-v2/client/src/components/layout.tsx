import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Receipt, Scale, Target, CalendarClock, Settings, Sun, Moon, ChevronLeft, ChevronRight, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/depenses", label: "Dépenses", icon: Receipt },
  { href: "/repartition", label: "Répartition", icon: Scale },
  { href: "/objectifs", label: "Objectifs", icon: Target },
  { href: "/echeances", label: "Échéances", icon: CalendarClock },
  { href: "/simulateur", label: "Simulateur", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-50 h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200",
          collapsed ? "w-16" : "w-56",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-14 px-3 border-b border-sidebar-border", collapsed ? "justify-center" : "gap-2.5")}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
            <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2" className="text-sidebar-primary" />
            <path d="M16 6v20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="text-sidebar-foreground/40" />
            <circle cx="10" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" className="text-sidebar-primary" />
            <circle cx="22" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" className="text-sidebar-primary" />
          </svg>
          {!collapsed && <span className="text-sm font-semibold tracking-tight whitespace-nowrap">Budget Couple</span>}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="p-2 border-t border-sidebar-border space-y-1">
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            data-testid="theme-toggle"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!collapsed && <span>{isDark ? "Mode clair" : "Mode sombre"}</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            data-testid="sidebar-collapse"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Réduire</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center h-12 px-3 border-b border-border bg-background">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 mr-2 rounded-md hover:bg-muted" data-testid="mobile-menu">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold">Budget Couple</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
