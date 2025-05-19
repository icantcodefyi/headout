'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { ScrollArea } from '~/components/ui/scroll-area';
import { 
  Home, 
  Globe, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  
  const routes = [
    {
      href: '/admin',
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
    },
    {
      href: '/admin/destinations',
      icon: <Globe className="h-5 w-5" />,
      label: 'Destinations',
    },
    {
      href: '/admin/stats',
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Statistics',
    },
  ];
  
  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(path);
  };
  
  // Mobile sidebar with Sheet component
  const mobileSidebar = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center px-4 border-b">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-medium">Admin Panel</h1>
            </div>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="flex flex-col gap-1 px-2">
              {routes.map((route) => (
                <NavItem 
                  key={route.href} 
                  {...route} 
                  isActive={isActive(route.href)} 
                  onClick={() => setOpen(false)}
                />
              ))}
            </nav>
          </ScrollArea>
          <div className="border-t p-4">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Back to Game
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
  
  // Desktop sidebar
  const desktopSidebar = (
    <div className="hidden h-screen w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-14 items-center px-4 border-b">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-medium">Admin Panel</h1>
        </div>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {routes.map((route) => (
            <NavItem 
              key={route.href} 
              {...route} 
              isActive={isActive(route.href)} 
            />
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Back to Game
          </Button>
        </Link>
      </div>
    </div>
  );
  
  return (
    <>
      {mobileSidebar}
      {desktopSidebar}
    </>
  );
} 