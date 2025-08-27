import { Button } from "@presentation/components/ui/button";
import { Activity, Users, Home, Clock, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@shared/utils/cn";

const navigation = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Análisis", href: "/reports", icon: TrendingUp },
  { name: "Historial", href: "/activity", icon: Clock },
  { name: "Admin", href: "/admin", icon: Users },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-gov-white border-b border-gov-accent shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-gov-primary" />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gov-black">Sistema Monitoreo</h1>
              <p className="text-xs text-gov-gray-a">Río Claro</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
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
                      : "text-gov-gray-a hover:text-gov-black hover:bg-gov-accent"
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Activity className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4 border-t border-gov-accent">
          <div className="grid grid-cols-3 gap-2">
            {navigation.slice(0, 6).map((item) => {
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
                      : "text-gov-gray-a hover:text-gov-black"
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