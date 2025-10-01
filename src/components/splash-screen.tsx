
'use client';

import { Icons } from '@/components/icons';
import { Loader2 } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-4 text-primary">
        <Icons.Logo className="size-16 animate-pulse" />
        <h1 className="text-5xl font-bold tracking-tighter">IronLog</h1>
      </div>
      <Loader2 className="mt-8 size-8 animate-spin text-muted-foreground" />
    </div>
  );
}
