

"use client";

import { usePathname } from 'next/navigation';
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
import { getGamification } from '@/lib/storage';
import { levelData } from '@/lib/gamification';
import { Badge } from '@/components/ui/badge';
import { Wand2, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/routines', icon: Icons.Routines, label: 'Rotinas' },
  { href: '/evolution', icon: Wand2, label: 'Evoluir' },
  { href: '/history', icon: Icons.History, label: 'Histórico' },
  { href: '/progress', icon: Icons.Progress, label: 'Progresso' },
  { href: '/levels', icon: Icons.Trophy, label: 'Níveis' },
  { href: '/exercises', icon: Icons.Exercises, label: 'Exercícios' },
];

const mobileBottomNavItems = [
    { href: '/dashboard', icon: Icons.Dashboard, label: 'Painel' },
    { href: '/routines', icon: Icons.Routines, label: 'Rotinas' },
    { href: '/session', icon: Icons.Add, label: 'Adicionar' },
    { href: '/history', icon: Icons.History, label: 'Histórico' },
];

const moreMenuItems = [
    { href: '/evolution', icon: Wand2, label: 'Evoluir' },
    { href: '/progress', icon: Icons.Progress, label: 'Progresso' },
    { href: '/levels', icon: Icons.Trophy, label: 'Níveis' },
    { href: '/exercises', icon: Icons.Exercises, label: 'Exercícios' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateGamification = () => {
      setGamification(getGamification());
    };
    
    updateGamification();
    
    window.addEventListener('storage', updateGamification);
    return () => {
      window.removeEventListener('storage', updateGamification);
    };
  }, [pathname]);

  const currentLevel = gamification?.level ?? 1;
  const { name: currentLevelName, color: currentLevelColor } = levelData[currentLevel] || levelData[1];


  return (
    <div style={{ '--primary': currentLevelColor } as React.CSSProperties}>
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-primary to-lime-400 text-primary-foreground">
                    <Icons.Logo className="size-6" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold">IronLog</h1>
                  <Badge variant="secondary" className="w-fit text-xs h-auto py-0.5 px-1.5">{currentLevelName}</Badge>
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
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={{ children: 'Configurações', side: 'right' }}>
                        <Link href="#">
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
                             item.href === '/session' && 'relative flex items-center justify-center'
                        )}
                    >
                         {item.href === '/session' ? (
                            <div className="aspect-square flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
                        <div className="grid grid-cols-2 gap-4 py-4">
                            {moreMenuItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex flex-col items-center gap-2 rounded-lg p-3 bg-secondary/50 active:bg-secondary"
                                >
                                    <item.icon className="size-6 text-primary" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
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
