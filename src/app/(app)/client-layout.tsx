"use client";

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import type { Gamification } from '@/lib/types';
import { getGamification, hasCompletedOnboarding } from '@/lib/storage';
import { levelData } from '@/lib/gamification';
import { Badge } from '@/components/ui/badge';
import { Wand2, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { href: '/routines', icon: Icons.Routines, label: 'Rotinas' },
  { href: '/evolution', icon: Wand2, label: 'Evoluir', requiresOnline: true },
  { href: '/history', icon: Icons.History, label: 'Histórico' },
  { href: '/progress', icon: Icons.Progress, label: 'Progresso' },
  { href: '/levels', icon: Icons.Trophy, label: 'BIIIRL!' },
  { href: '/exercises', icon: Icons.Exercises, label: 'Exercícios' },
];

const mobileBottomNavItems = [
    { href: '/dashboard', icon: Icons.Dashboard, label: 'Painel' },
    { href: '/routines', icon: Icons.Routines, label: 'Rotinas' },
    { href: '/session', icon: Icons.Add, label: 'Adicionar' },
    { href: '/history', icon: Icons.History, label: 'Histórico' },
];

const moreMenuItems = [
    { href: '/evolution', icon: Wand2, label: 'Evoluir', requiresOnline: true },
    { href: '/progress', icon: Icons.Progress, label: 'Progresso' },
    { href: '/levels', icon: Icons.Trophy, label: 'BIIIRL!' },
    { href: '/exercises', icon: Icons.Exercises, label: 'Exercícios' },
    { href: '/settings', icon: Icons.Settings, label: 'Configurações' },
]

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // A lógica de verificação de onboarding foi movida para a página raiz (page.tsx)
    // para evitar o piscar da tela de welcome.
    if (typeof window !== 'undefined') {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }
  }, []);

  useEffect(() => {
    const updateGamification = () => {
      const data = getGamification();
      setGamification(data);
    };
    
    updateGamification();
    
    window.addEventListener('storage', updateGamification);
    return () => {
      window.removeEventListener('storage', updateGamification);
    };
  }, []);
  

  const currentLevel = gamification?.level ?? 1;
  const { name: currentLevelName, color: currentLevelColor } = levelData[currentLevel] || levelData[1];

  const renderSidebarMenuItem = (item: typeof navItems[0]) => {
    const isDisabled = item.requiresOnline && !isOnline;

    const menuItem = (
        <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
            tooltip={{ children: item.label, side: 'right' }}
            disabled={isDisabled}
            aria-disabled={isDisabled}
        >
            <Link href={isDisabled ? '#' : item.href} className={cn(isDisabled && 'pointer-events-none opacity-50')}>
                <item.icon />
                <span>{item.label}</span>
            </Link>
        </SidebarMenuButton>
    );

    if (isDisabled) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{menuItem}</TooltipTrigger>
                <TooltipContent side="right" align="center">
                    <p>Funcionalidade online</p>
                </TooltipContent>
            </Tooltip>
        );
    }
    return menuItem;
  }

  const renderMobileMoreMenuItem = (item: typeof moreMenuItems[0]) => {
    const isDisabled = item.requiresOnline && !isOnline;

    const menuItem = (
         <Link
            href={isDisabled ? '#' : item.href}
            onClick={() => !isDisabled && setMobileMenuOpen(false)}
            className={cn(
                "flex flex-col items-center gap-2 rounded-lg p-3 bg-secondary/50 active:bg-secondary",
                isDisabled && 'opacity-50 pointer-events-none'
            )}
        >
            <item.icon className="size-6 text-primary" />
            <span className="text-sm font-medium text-center">{item.label}</span>
        </Link>
    );

    if (isDisabled) {
        return (
            <Tooltip>
                <TooltipTrigger asChild><div className="flex flex-col items-center">{menuItem}</div></TooltipTrigger>
                <TooltipContent side="top">
                    <p>Funcionalidade online</p>
                </TooltipContent>
            </Tooltip>
        )
    }

    return menuItem;
  }


  return (
    <div style={{ '--primary': currentLevelColor } as React.CSSProperties}>
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-800">
                    <Icons.Logo className="size-6" style={{color: 'hsl(130 100% 50%)'}}/>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold">IronLog</h1>
                  <Badge 
                    style={{ 
                      backgroundColor: 'hsl(var(--primary))', 
                      color: 'hsl(var(--primary-foreground))' 
                    }}
                    className="w-fit text-xs h-auto py-0.5 px-1.5 border-transparent"
                  >
                    {currentLevelName}
                  </Badge>
                </div>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
                tooltip={{ children: 'Painel', side: 'right' }}
              >
                <Link href="/dashboard">
                  <Icons.Dashboard />
                  <span>Painel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {renderSidebarMenuItem(item)}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={{ children: 'Configurações', side: 'right' }} isActive={pathname === '/settings'}>
                        <Link href="/settings">
                            <Icons.Settings />
                            <span>Configurações</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
            {children}
        </main>
        
        {/* Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
            <div className="grid h-16 grid-cols-5 items-center">
                {mobileBottomNavItems.map((item) => {
                  const isActive = item.href === '/session' ? false : pathname.startsWith(item.href);
                  return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex h-full w-full flex-col items-center justify-center gap-1 text-xs",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground",
                             item.href === '/session' && 'relative -top-3 flex-col'
                        )}
                    >
                         {item.href === '/session' ? (
                            <div className="aspect-square flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                                 <item.icon className="size-6" />
                            </div>
                        ) : (
                            <>
                                <item.icon className="size-5" />
                                <span>{item.label}</span>
                            </>
                        )}
                    </Link>
                  )
                })}

                {/* More Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <button
                            className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
                        >
                            <Menu className="size-5" />
                            <span>Mais</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto">
                        <SheetHeader>
                            <SheetTitle className="sr-only">Mais Opções</SheetTitle>
                        </SheetHeader>
                        <div className="grid grid-cols-3 gap-4 py-4">
                            {moreMenuItems.map(item => (
                                <div key={item.href}>
                                  {renderMobileMoreMenuItem(item)}
                                </div>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
