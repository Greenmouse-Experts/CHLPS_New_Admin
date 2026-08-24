"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/tokens";
import { ConfirmModal } from "../ui/Modal";
import {
  Category,
  Profile2User,
  Book,
  MessageQuestion,
  MedalStar,
  Wallet3,
  Messages2,
  Setting2,
  Notification,
  ArrowDown2,
  HambergerMenu,
  SidebarLeft as SidebarIcon,
  Logout,
  Lock,
  Teacher,
  Edit,
} from "iconsax-react";
import ProtectedRoute from "@/lib/providers/ProtectedRoute";
import { UserState, resetUser } from "@/features/auth/reducers/user_slice";
import { RootState } from "@/lib/store/store";
import { useSelector, useDispatch } from "react-redux";
import { getDB } from "@/lib/storage/user_db";

type Role = string;

interface NavChild {
  label: string;
  href: string;
  roles?: Role[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: Role[];
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <Category size={16} color="currentColor" />,
  },
  {
    label: "User Management",
    href: "/admins",
    icon: <Profile2User size={16} color="currentColor" />,
    roles: ["admin"],
    children: [
      { label: "Admins", href: "/admins", roles: ["admin"] },
      { label: "Students", href: "/students", roles: ["admin"] },
    ],
  },
  {
    label: "Courses",
    href: "/courses",
    icon: <Book size={16} color="currentColor" />,
    children: [
      { label: "Programs", href: "/programs", roles: ["admin", "sub-admin"] },
      { label: "All Courses", href: "/courses" },
    ],
  },
  {
    label: "Blog",
    href: "/blog",
    icon: <Edit size={16} color="currentColor" />,
    roles: ["admin"],
    children: [
      { label: "Tags", href: "/blog-tags", roles: ["admin"] },
      { label: "Posts", href: "/blog", roles: ["admin"] },
    ],
  },
  {
    label: "Testimonials",
    href: "/testimonials",
    icon: <Teacher size={16} color="currentColor" />,
  },
  {
    label: "FAQs",
    href: "/faqs",
    icon: <MessageQuestion size={16} color="currentColor" />,
    roles: ["admin"],
  },
  {
    label: "Certificates",
    href: "/certificates",
    icon: <MedalStar size={16} color="currentColor" />,
    roles: ["admin"],
    children: [
      { label: "All Certificates", href: "/certificates", roles: ["admin"] },
      { label: "Templates", href: "/certificates/templates", roles: ["admin"] },
    ],
  },
  {
    label: "Payments",
    href: "/payments",
    icon: <Wallet3 size={16} color="currentColor" />,
    roles: ["admin"],
  },
  {
    label: "Support",
    href: "/support",
    icon: <Messages2 size={16} color="currentColor" />,
  },
  {
    label: "Settings",
    href: "/profile",
    icon: <Setting2 size={16} color="currentColor" />,
    children: [
      { label: "My Profile", href: "/profile" },
      { label: "Notifications", href: "/notify" },
    ],
  },
];

function canSee(roles: Role[] | undefined, userRole?: string | null) {
  if (!roles || roles.length === 0) return true;
  return !!userRole && roles.includes(userRole);
}

function NavItemRow({
  item,
  collapsed,
  userRole,
}: {
  item: NavItem;
  collapsed: boolean;
  userRole?: string | null;
}) {
  const pathname = usePathname();
  const visibleChildren =
    item.children?.filter((c) => canSee(c.roles, userRole)) ?? [];

  const [open, setOpen] = useState(
    () =>
      !!visibleChildren.some(
        (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
      ),
  );

  const isActive = visibleChildren.length
    ? visibleChildren.some(
        (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
      )
    : pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href + "/"));

  const hasChildren = visibleChildren.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
            "transition-colors duration-150",
            isActive
              ? "text-black"
              : "text-[#717171] hover:text-black hover:bg-[#F7F7F7]",
          )}
        >
          <span className="shrink-0">{item.icon}</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <span
                className={cn(
                  "transition-transform duration-200 text-[#717171]",
                  open && "rotate-180",
                )}
              >
                <ArrowDown2 size={12} color="currentColor" />
              </span>
            </>
          )}
        </button>

        {!collapsed && open && (
          <div className="ml-8 mt-0.5 flex flex-col gap-0.5">
            {visibleChildren.map((child) => {
              const childActive =
                pathname === child.href ||
                (child.href !== item.href &&
                  pathname.startsWith(child.href + "/"));
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "block px-3 py-1.5 rounded-md text-sm transition-colors",
                    childActive
                      ? "font-semibold text-black"
                      : "text-[#717171] hover:text-black hover:bg-[#F7F7F7]",
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
        "transition-colors duration-150",
        isActive
          ? "bg-black text-white"
          : "text-[#717171] hover:text-black hover:bg-[#F7F7F7]",
      )}
      title={collapsed ? item.label : undefined}
    >
      <span className={cn("shrink-0", isActive ? "text-white" : "")}>
        {item.icon}
      </span>
      {!collapsed && <span className="flex-1 text-[14px]">{item.label}</span>}
    </Link>
  );
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const userRole = useSelector((state: RootState) => state.user.userRole);

  const visibleItems = NAV_ITEMS.filter((item) => canSee(item.roles, userRole));

  async function handleLogout() {
    try {
      const db = await getDB();
      const store = db.transaction("users", "readwrite").objectStore("users");
      await store.clear();
    } catch {
      /* ignore */
    }
    dispatch(resetUser());
    router.replace("/auth/login");
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-[#E7E9EB]",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#E7E9EB] shrink-0">
        {!collapsed && (
          <Link href="/" className="text-xl font-bold text-black tracking-tight">
            CHL<span className="text-[#717171]">PS</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#717171] hover:text-black hover:bg-[#F7F7F7] transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          <SidebarIcon size={16} color="currentColor" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {visibleItems.map((item) => (
          <NavItemRow
            key={item.href + item.label}
            item={item}
            collapsed={collapsed}
            userRole={userRole}
          />
        ))}
      </nav>

      <div className="shrink-0 px-2 pb-3 border-t border-[#E7E9EB] pt-2">
        <button
          onClick={() => setLogoutOpen(true)}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
            "text-[#E84D52] hover:bg-[#FFF0F0] transition-colors duration-150",
          )}
        >
          <span className="shrink-0">
            <Logout size={16} color="currentColor" />
          </span>
          {!collapsed && <span className="flex-1 text-left">Logout</span>}
        </button>
      </div>

      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Log out"
        description="Are you sure you want to log out of your account?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        variant="danger"
      />
    </aside>
  );
}

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
  user: UserState;
}

export function Header({ title, onMenuToggle, user }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#E7E9EB] bg-white flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#717171] hover:text-black hover:bg-[#F7F7F7]"
        >
          <HambergerMenu size={18} color="currentColor" />
        </button>
        {title && (
          <span className="text-sm font-semibold text-black uppercase tracking-wide">
            {title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/notify"
          className="relative w-9 h-9 min-w-9 max-w-9 rounded-full border border-gray-200 flex cursor-pointer items-center justify-center text-[#717171] hover:text-black bg-[#F7F7F7] hover:bg-gray-100 transition-colors"
        >
          <Notification size={18} color="currentColor" />
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-2 pl-2 bg-gray-100 rounded-full p-1 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 shrink-0 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold overflow-hidden">
            {user.avatar ? (
               
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              (user?.fullName || "A").trim().toUpperCase()[0]
            )}
          </div>
          <div className="hidden sm:block pr-2">
            <p className="text-sm font-medium text-black leading-none">
              {user.fullName || "Admin"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
      <div className="w-14 h-14 rounded-full bg-[#FFF0F0] flex items-center justify-center shrink-0">
        <Lock size={24} color="#E84D52" />
      </div>
      <p className="text-base font-semibold text-black">Access Denied</p>
      <p className="text-sm text-[#717171] max-w-xs">
        You don&apos;t have permission to view this page. Contact your
        administrator if you think this is a mistake.
      </p>
    </div>
  );
}

function collectRoutes(items: NavItem[]): { href: string; roles?: Role[] }[] {
  const routes: { href: string; roles?: Role[] }[] = [];
  items.forEach((item) => {
    routes.push({ href: item.href, roles: item.roles });
    item.children?.forEach((c) => routes.push({ href: c.href, roles: c.roles ?? item.roles }));
  });
  return routes;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const user = useSelector((state: RootState) => state.user);
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasAccess = useMemo(() => {
    const routes = collectRoutes(NAV_ITEMS).sort(
      (a, b) => b.href.length - a.href.length,
    );
    const matched = routes.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(item.href + "/")),
    );
    if (!matched) return true;
    return canSee(matched.roles, user.userRole);
  }, [pathname, user.userRole]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#F7F7F7] overflow-hidden w-full">
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className="hidden md:flex shrink-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
          />
        </div>

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 md:hidden transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar onToggle={() => setMobileOpen(false)} />
        </div>

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header
            title={title}
            onMenuToggle={() => setMobileOpen(true)}
            user={user}
          />
          <main className="flex-1 overflow-y-auto p-5 md:p-6">
            {hasAccess ? children : <AccessDenied />}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
