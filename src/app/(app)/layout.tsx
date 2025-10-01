
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

const navItems = [
  { href: '/dashboard', icon: Icons.Dashboard, label: 'Painel' },
  { href: '/routines', icon: Icons.Routines, label: 'Rotinas' },
  { href: '/history', icon: Icons.History, label: 'Histórico' },
  { href: '/progress', icon: Icons.Progress, label: 'Progresso' },
  { href: '/levels', icon: Icons.Trophy, label: 'Níveis' },
  { href: '/exercises', icon: Icons.Exercises, label: 'Exercícios' },
];

const mobileNavItems = [
    { href: '/dashboard', icon: Icons.Dashboard, label: 'Painel' },
    { href: '/routines', icon: Icons.Routines, label: 'Rotinas' },
    { href: '/session', icon: Icons.Add, label: 'Iniciar' }, // Ação Central
    { href: '/history', icon: Icons.History, label: 'Histórico' },
    { href: '/levels', icon: Icons.Trophy, label: 'Níveis' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [gamification, setGamification] = useState<Gamification | null>(null);

  useEffect(() => {
    // A gamificação será lida do localStorage, que só está disponível no cliente.
    // Isso evita problemas de hidratação.
    setGamification(getGamification());
    
    // Adiciona um listener para atualizar a gamificação quando ela mudar em outra aba
    const handleStorageChange = () => {
      setGamification(getGamification());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  const currentLevel = gamification?.level ?? 1;
  const currentLevelName = levelData[currentLevel]?.name ?? 'Carregando...';


  return (
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
            <div className="flex justify-around items-center h-16">
                {mobileNavItems.map((item) => {
                  const isActive = item.href === '/session' ? pathname === item.href : pathname.startsWith(item.href);
                  if (item.href === '/session') {
                    return (
                        <div key={item.href} className="-mt-8">
                            <Button asChild size="lg" className="rounded-full h-16 w-16 shadow-lg bg-primary hover:bg-primary/90 border-4 border-background">
                               <Link href={item.href}>
                                    <item.icon className="size-8" />
                                    <span className="sr-only">{item.label}</span>
                                </Link>
                            </Button>
                        </div>
                    );
                  }
                  return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 text-xs w-full h-full",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="size-5" />
                        <span>{item.label}</span>
                    </Link>
                  )
                })}
            </div>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}
