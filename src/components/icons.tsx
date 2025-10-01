import type { LucideProps } from 'lucide-react';
import {
  LayoutDashboard,
  Dumbbell,
  BookCopy,
  Clock,
  BarChart3,
  Weight,
  Cog,
  Plus,
  MoreVertical,
  ChevronDown,
  Flame,
  Star,
  Zap,
  PartyPopper,
  Award,
  Trophy,
  Baby,
  Bone,
  Construction,
  Crown,
  Sparkles,
  Swords,
  Shield,
  Ghost,
  Pencil
} from 'lucide-react';

// Nivel 1: Frango em Crescimento
const Level1Icon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18.5 14.5c0-3-2.5-5.5-5.5-5.5s-5.5 2.5-5.5 5.5" />
    <path d="M12 1a2.5 2.5 0 0 0 -2.5 2.5" />
    <path d="M14.5 3.5a2.5 2.5 0 0 0 -2.5 -2.5" />
    <path d="M12 14.5c0 0-2 2-4 2s-4-2-4-2" />
    <path d="M22 14.5c0 0-2 2-4 2s-4-2-4-2" />
  </svg>
);

// Nivel 2: Tá Saindo da Jaula
const Level2Icon = (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M12 5.5A4.5 4.5 0 0 1 16.5 10m-9 0A4.5 4.5 0 0 1 12 5.5m0 0V3"/>
        <path d="M18 10h2"/>
        <path d="M4 10h2"/>
        <path d="M12 17a5 5 0 0 0 5-5H7a5 5 0 0 0 5 5z"/>
        <path d="M8 17v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1"/>
        <path d="M15 14s-1 2-3 2-3-2-3-2"/>
    </svg>
);

export const Icons = {
  Logo: (props: LucideProps) => <Dumbbell {...props} />,
  Dashboard: LayoutDashboard,
  Routines: BookCopy,
  History: Clock,
  Progress: BarChart3,
  Exercises: Weight,
  Settings: Cog,
  Add: Plus,
  More: MoreVertical,
  ChevronDown,
  Flame,
  Star,
  Zap,
  PartyPopper,
  Award,
  Trophy,
  Pencil,
  Level1: Level1Icon,
  Level2: Level2Icon,
  Level3: Swords,
  Level4: Construction,
  Level5: Dumbbell,
  Level6: Shield,
  Level7: Ghost,
  Level8: Flame,
  Level9: Crown,
  Level10: Sparkles,
};
