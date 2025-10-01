"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: Icons.Dashboard, label: 'Dashboard' },
  { href: '/routines', icon: Icons.Routines, label: 'Routines' },
  { href: '/history', icon: Icons.History, label: 'History' },
  { href: '/progress', icon: Icons.Progress, label: 'Progress' },
  { href: '/exercises', icon: Icons.Exercises, label: 'Exercises' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
                <Icons.Logo className="size-8 text-primary" />
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
                    <SidebarMenuButton asChild tooltip={{ children: 'Settings', side: 'right' }}>
                        <Link href="#">
                            <Icons.Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex justify-start p-4 md:hidden">
            <SidebarTrigger />
        </div>
        <main className="flex-1 p-4 md:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
