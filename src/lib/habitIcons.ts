import {
  Apple,
  BedDouble,
  Bike,
  BookOpen,
  Brain,
  Calculator,
  Car,
  Code,
  Coffee,
  Droplets,
  Dumbbell,
  Footprints,
  Gamepad2,
  GraduationCap,
  Heart,
  Languages,
  LucideIcon,
  MessageCircle,
  Music,
  Pencil,
  Pill,
  Puzzle,
  ShowerHead,
  Smile,
  Sparkles,
  Sun,
  Trees,
  Tv,
  Utensils,
  Wallet,
} from 'lucide-react-native';

export interface HabitIconDef {
  name: string;
  label: string;
  Icon: LucideIcon;
}

/** `name` is what gets saved in the database. Never rename existing names. */
export const HABIT_ICONS: HabitIconDef[] = [
  // Daily life
  { name: 'water', label: 'Drink water', Icon: Droplets },
  { name: 'coffee', label: 'Tea / Coffee', Icon: Coffee },
  { name: 'cook', label: 'Eat / Cook', Icon: Utensils },
  { name: 'food', label: 'Healthy food', Icon: Apple },
  { name: 'wake', label: 'Wake early', Icon: Sun },
  { name: 'sleep', label: 'Sleep', Icon: BedDouble },
  { name: 'shower', label: 'Shower', Icon: ShowerHead },
  { name: 'clean', label: 'Clean', Icon: Sparkles },

  // Body
  { name: 'workout', label: 'Gym', Icon: Dumbbell },
  { name: 'walk', label: 'Walking', Icon: Footprints },
  { name: 'cycle', label: 'Cycle', Icon: Bike },
  { name: 'outdoors', label: 'Outdoors', Icon: Trees },
  { name: 'medicine', label: 'Medicine', Icon: Pill },

  // Mind and study
  { name: 'study', label: 'Study', Icon: GraduationCap },
  { name: 'math', label: 'Math', Icon: Calculator },
  { name: 'language', label: 'English', Icon: Languages },
  { name: 'reasoning', label: 'Reasoning', Icon: Puzzle },
  { name: 'code', label: 'Coding', Icon: Code },
  { name: 'read', label: 'Read', Icon: BookOpen },
  { name: 'journal', label: 'Journal', Icon: Pencil },
  { name: 'meditate', label: 'Meditate', Icon: Brain },
  { name: 'gratitude', label: 'Gratitude', Icon: Smile },
  { name: 'selfcare', label: 'Self-care', Icon: Heart },

  // Fun and life
  { name: 'gaming', label: 'Gaming', Icon: Gamepad2 },
  { name: 'watch', label: 'TV', Icon: Tv },
  { name: 'music', label: 'Music', Icon: Music },
  { name: 'chat', label: 'Communication', Icon: MessageCircle },
  { name: 'drive', label: 'Driving', Icon: Car },
  { name: 'money', label: 'Save money', Icon: Wallet },
];

export const DEFAULT_HABIT_ICON = 'water';

const ICON_COMPONENTS: Record<string, LucideIcon> = Object.fromEntries(
  HABIT_ICONS.map((i) => [i.name, i.Icon]),
);

/** Makes sure an unknown value (e.g. from an old backup) becomes a valid icon name. */
export function normalizeIcon(name: unknown): string {
  return typeof name === 'string' && name in ICON_COMPONENTS
    ? name
    : DEFAULT_HABIT_ICON;
}

/** Icon components by saved name. Use with normalizeIcon() so the key always exists. */
export const HABIT_ICON_COMPONENTS = ICON_COMPONENTS;
