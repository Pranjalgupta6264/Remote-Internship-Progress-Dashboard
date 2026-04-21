'use client';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  UserCircle,
  CheckSquare,
  Star
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Navigation items based on role
  const getNavItems = () => {
    const commonItems: Array<{ name: string; href: string; icon: ComponentType<{ size?: number }> }> = [];

    const roleSpecific = {
      admin: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }, // ✅ added
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ],
      mentor: [
        { name: 'Kanban Board', href: '/mentor/kanban', icon: KanbanSquare },
        { name: 'Tasks', href: '/mentor/tasks', icon: CheckSquare },
        { name: 'Pending Reports', href: '/mentor/reports', icon: FileText },
        { name: 'Feedback', href: '/mentor/feedback', icon: MessageSquare },
        { name: 'Analytics', href: '/mentor/analytics', icon: BarChart3 },
      ],
      intern: [
        { name: 'My Tasks', href: '/intern/tasks', icon: CheckSquare },
        { name: 'Submit Report', href: '/intern/reports/new', icon: FileText },
        { name: 'My Reports', href: '/intern/reports', icon: FileText },
        { name: 'My Feedback', href: '/intern/feedback', icon: Star },
        { name: 'My Progress', href: '/intern/analytics', icon: BarChart3 },
      ],
    };

    return [...commonItems, ...roleSpecific[user.role as keyof typeof roleSpecific]];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-dark-1">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-dark-2 border-r border-white/10 transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🚀</span>
              </div>
              {sidebarOpen && (
                <span className="font-bold text-white">InternFlow</span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href); // ✅ better active check
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-500'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span className="text-sm">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <UserCircle size={24} className="text-white" />
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{user?.full_name}</p>
                  <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-dark-2/80 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-3">
            <h1 className="text-lg font-semibold text-white capitalize">
              {user?.role} Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                <Bell size={20} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}