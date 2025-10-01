
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

const navItems = [
  { href: '/dashboard', icon: Icons.Dashboard, label: 'Painel' },
  { href: '/routines', icon: Icons.Routines, label: 'Rotinas' },
  { href: '/history', icon: Icons.History, label: 'Histórico' },
  { href: '/progress', icon: Icons.Progress, label: 'Progresso' },
  { href: '/exercises', icon: Icons.Exercises, label: 'Exercícios' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-primary to-green-400 text-primary-foreground">
                    <Icons.Logo className="size-6" />
                </div>
                <h1 className="text-2xl font-bold">IronLog</h1>
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
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
            {children}
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 text-xs w-full h-full",
                            pathname.startsWith(item.href)
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="size-5" />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}
