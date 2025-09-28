import { Button } from "@shared/components/ui/button";
import { ThemeToggle } from "@shared/components/ui/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@shared/components/ui/dropdown-menu";
import { Activity, Users, Clock, TrendingUp, LogOut, User, ChevronDown, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@shared/utils/cn";
import { useAuth } from "@features/auth/stores/AuthStore";

// Función para filtrar navegación según rol del usuario
const getNavigationForUser = (userRole?: string) => {
  const baseNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: Activity },
    { name: "Análisis", href: "/reports", icon: TrendingUp },
  ];

  // Historial solo para Técnicos y Administradores
  if (userRole === 'Técnico' || userRole === 'Administrador') {
    baseNavigation.push({ name: "Historial", href: "/activity", icon: Clock });
  }

  // Configuración de Alertas para Técnicos y Administradores
  if (userRole === 'Técnico' || userRole === 'Administrador') {
    baseNavigation.push({ name: "Alertas", href: "/alerts/configuration", icon: Settings });
  }

  // Admin solo para Administradores
  if (userRole === 'Administrador') {
    baseNavigation.push({ name: "Admin", href: "/admin", icon: Users });
  }

  return baseNavigation;
};

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Si no está autenticado, no mostrar el navbar
  if (!isAuthenticated || !user) {
    return null;
  }

  const navigation = getNavigationForUser(user.role);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav className="bg-gov-white dark:bg-gov-white border-b border-gov-accent dark:border-gov-accent shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-gov-primary" />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gov-black dark:text-gov-black">Sistema Monitoreo</h1>
              <p className="text-xs text-gov-gray-a">Río Claro</p>
            </div>
          </Link>

          {/* Navigation Links, User Menu and Theme Toggle */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "text-sm font-medium",
                    isActive
                      ? "bg-gov-primary text-white"
                      : "text-gov-gray-a hover:text-gov-black dark:text-gov-gray-a dark:hover:text-gov-black hover:bg-gov-accent dark:hover:bg-gov-accent"
                  )}
                >
                  <Link to={item.href} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              );
            })}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">{user.first_name || user.username}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  <div className="font-medium">{user.first_name} {user.last_name}</div>
                  <div className="text-xs">{user.email}</div>
                  <div className="text-xs text-gov-primary font-medium">{user.role}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
          </div>

          {/* Mobile menu and user menu */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  <div className="font-medium">{user.first_name} {user.last_name}</div>
                  <div className="text-xs">{user.email}</div>
                  <div className="text-xs text-gov-primary font-medium">{user.role}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4 border-t border-gov-accent">
          <div className="grid grid-cols-3 gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex flex-col h-auto py-2 text-xs",
                    isActive
                      ? "bg-gov-primary text-white"
                      : "text-gov-gray-a hover:text-gov-black dark:text-gov-gray-a dark:hover:text-gov-black"
                  )}
                >
                  <Link to={item.href} className="flex flex-col items-center space-y-1">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}