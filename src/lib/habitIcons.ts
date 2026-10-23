import {
  Activity,
  Apple,
  BedDouble,
  Bike,
  BookOpen,
  Brain,
  Calculator,
  Car,
  Clock,
  Code,
  Coffee,
  Droplets,
  Dumbbell,
  Flame,
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
  Sprout,
  Sun,
  Target,
  Trees,
  Tv,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react-native';

export interface HabitIconDef {
  name: string;
  label: string;
  Icon: LucideIcon;
}

/**
 * 30 curated daily habit icons arranged in 5 balanced rows of 6.
 * `name` is what gets saved in the database. Never rename existing names.
 */
export const HABIT_ICONS: HabitIconDef[] = [
  // Row 1: Daily life & nourishment
  { name: 'water', label: 'Drink water', Icon: Droplets },
  { name: 'coffee', label: 'Tea / Coffee', Icon: Coffee },
  { name: 'cook', label: 'Eat / Cook', Icon: Utensils },
  { name: 'food', label: 'Healthy food', Icon: Apple },
  { name: 'wake', label: 'Wake early', Icon: Sun },
  { name: 'sleep', label: 'Sleep well', Icon: BedDouble },

  // Row 2: Fitness & Health
  { name: 'workout', label: 'Gym / Workout', Icon: Dumbbell },
  { name: 'run', label: 'Running / Cardio', Icon: Flame },
  { name: 'walk', label: 'Walking / Steps', Icon: Footprints },
  { name: 'activity', label: 'Yoga / Stretch', Icon: Activity },
  { name: 'cycle', label: 'Cycling', Icon: Bike },
  { name: 'medicine', label: 'Vitamins / Meds', Icon: Pill },

  // Row 3: Mindfulness & Self-care
  { name: 'meditate', label: 'Meditation', Icon: Brain },
  { name: 'selfcare', label: 'Self-care', Icon: Heart },
  { name: 'gratitude', label: 'Gratitude / Mood', Icon: Smile },
  { name: 'shower', label: 'Hygiene / Shower', Icon: ShowerHead },
  { name: 'clean', label: 'Clean / Tidy', Icon: Sparkles },
  { name: 'outdoors', label: 'Outdoors / Nature', Icon: Trees },

  // Row 4: Focus & Learning
  { name: 'focus', label: 'Deep work / Focus', Icon: Target },
  { name: 'timer', label: 'Routine / Pomodoro', Icon: Clock },
  { name: 'energy', label: 'Energy boost', Icon: Zap },
  { name: 'read', label: 'Read books', Icon: BookOpen },
  { name: 'journal', label: 'Journal / Write', Icon: Pencil },
  { name: 'study', label: 'Study / Learn', Icon: GraduationCap },

  // Row 5: Skills & Life
  { name: 'code', label: 'Coding / Build', Icon: Code },
  { name: 'language', label: 'Languages', Icon: Languages },
  { name: 'reasoning', label: 'Brain puzzles', Icon: Puzzle },
  { name: 'music', label: 'Music / Practice', Icon: Music },
  { name: 'nature', label: 'Plants / Garden', Icon: Sprout },
  { name: 'money', label: 'Save money', Icon: Wallet },
];

export const DEFAULT_HABIT_ICON = 'water';

const ALL_ICON_MAP: Record<string, LucideIcon> = {
  ...Object.fromEntries(HABIT_ICONS.map((i) => [i.name, i.Icon])),
  // Legacy mappings for backward compatibility so older backups/habits continue to render:
  math: Calculator,
  drive: Car,
  gaming: Gamepad2,
  chat: MessageCircle,
  watch: Tv,
};

/** Makes sure an unknown value (e.g. from an old backup) becomes a valid icon name. */
export function normalizeIcon(name: unknown): string {
  return typeof name === 'string' && name in ALL_ICON_MAP
    ? name
    : DEFAULT_HABIT_ICON;
}

/** Icon components by saved name. Use with normalizeIcon() so the key always exists. */
export const HABIT_ICON_COMPONENTS = ALL_ICON_MAP;
