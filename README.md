# StoneStreak

**Build habits that stick, one day at a time.**

StoneStreak is a simple, private habit tracker for Android. Create the habits you care about, check them off every day, and watch your streaks and heat map grow. There is no account, no ads and no internet needed. Everything stays on your phone.

---

## Why StoneStreak

- **Fast.** Open the app and your day is right there. One tap checks a habit off.
- **Private.** Your data lives only on your device. Nothing is uploaded, tracked or sold.
- **Flexible.** Daily habits, specific weekdays, simple done/not done or counted goals like "8 glasses of water".
- **Motivating.** Streaks, completion rates and a 12-month heat map show your progress at a glance.
- **Yours to keep.** Export a backup file at any time and restore it on a new phone.

---

## Features

### Today

Your home screen. It shows today's date, a progress card (for example "3 of 5 done") with a percentage and progress bar, and the list of habits scheduled for today.

- Tick a habit with one tap.
- Counted habits have **+** and **−** buttons and show progress like `5/8`. You can go above your goal.
- A flame shows your current streak next to each habit.
- Finished habits fade and are crossed out so you can see what is left.
- Tap a habit to open its full statistics.
- A friendly empty state appears on days with nothing scheduled, and for brand-new users.

### Habits

Everything you track, in your own order.

- Press and hold a habit, or grab the handle on the right, and drag it to reorder. Your order is saved and used on the Today screen too.
- Each card shows the icon, name, description, schedule, daily goal and reminder time.
- The **+** button creates a new habit.

### Create and edit a habit

Make a habit look and behave exactly the way you want.

- **Name and description:** a short title, plus an optional note about why it matters to you.
- **Type:**
  - _Checkbox_ – done or not done, once a day.
  - _Count_ – reach a daily goal (for example 8 glasses of water, 20 pages, 10,000 steps). Going above the goal is allowed and celebrated in your stats.
- **Icon:** choose from 29 icons covering daily life, body, mind and study, and fun.
- **Color:** choose from 14 colors. The color is used throughout the app for that habit.
- **Repeat:** every day, or only on the days you pick (for example Monday, Wednesday, Friday).
- **Reminder:** switch on a reminder and choose the time with the standard Android time picker.
- If you leave with unsaved changes, StoneStreak asks before throwing them away.

### Habit details

Tap any habit to see how you are really doing.

- **Statistics:** current streak, best streak, completion rate, total check-ins (or days the goal was reached), and for counted habits the total count and your best day.
- **Last 7 days:** a small bar chart of the past week.
- **Last 12 months:** a heat map in the habit's own color. Tap any square to see that day's result: done, missed, not scheduled, or how close you got to the goal.
- **Log a past day:** forgot to tick something yesterday? Pick a date from the past year and record it. StoneStreak tells you if the day is before the habit existed or outside its schedule, so there are no surprises in your streak.
- **Archive:** hide a habit without losing its history.
- **Delete:** remove a habit and its history for good, after a confirmation.

### Analytics

The big picture across all your active habits.

- Current streak and best streak (the longest of any habit).
- Completion rate for the last 30 days.
- Total check-ins.
- A 7-day bar chart and a 12-month heat map. The darker the square, the more of that day's habits you completed.

### Reminders

Gentle nudges at the time you choose.

- Each habit can have its own reminder time and follows its own schedule, so a Monday-Wednesday-Friday habit only reminds you on those days.
- If you have already completed a habit today, today's reminder is skipped. Undo it and the reminder returns.
- Tapping a reminder opens that habit, even if the app was closed.
- One switch in Settings pauses every reminder at once.
- Reminders are scheduled ahead for roughly the next two weeks and refreshed every time you open the app. If you have many habits with reminders, the window is shortened to keep things reliable. Opening StoneStreak at least every couple of weeks keeps them going.

### Archive

Habits you no longer follow but do not want to lose. Archived habits are hidden from Today and Habits, their reminders stop, and their history is kept. Open **Settings → Archived habits** to restore one or delete it permanently.

### Settings

- **Appearance:** System, Light or Dark theme.
- **Reminders:** turn all reminders on or off.
- **Haptic feedback:** turn vibration feedback on or off.
- **Archived habits:** restore or permanently delete.
- **Export data:** save all habits (including archived ones) and your full history as a backup file you can share or store anywhere.
- **Import data:** restore from a backup file. You are asked to confirm before your current data is replaced.
- **Delete all data:** wipe everything after a confirmation.
- **About:** version and a reminder that your data stays on your device.

### Welcome tour

New users see a short three-page introduction on first launch. It never appears again once finished or skipped.

---

## How streaks work

StoneStreak aims to be fair, not punishing.

- A streak counts consecutive **scheduled** days you completed a habit.
- Days a habit is not scheduled never break the streak. A Monday-to-Friday habit keeps its streak over the weekend.
- If today is scheduled but not done yet, your streak is safe. The day is not over.
- Counted habits are complete when you reach the daily goal.
- Your best streak is the longest run since the habit was created.
- Statistics start on the day a habit was created. Days logged before that are saved but do not count toward streaks or the heat map.

---

## Your data and privacy

- All data is stored locally on your device in a private database.
- StoneStreak has no accounts, no servers, no analytics and no ads.
- Backups are plain, readable files you control. Nothing leaves your phone unless you choose to share an export.
- Notifications are scheduled and shown by your phone. No data is sent anywhere for them.

### Backups

- Export creates a single file named like `stonestreak-backup-2026-10-14.json`.
- It contains your habits (active and archived) and every completion.
- Importing validates the file, ignores damaged entries, and replaces your current data only after you confirm.
- Backups from earlier versions of StoneStreak still import.

---

## Good to know

- StoneStreak is built for **Android** and supports portrait orientation.
- The app follows your phone's light or dark mode unless you choose otherwise in Settings.
- Reminders need notification permission. If you decline, StoneStreak explains how to enable it in your phone's settings.
- Before changing phones, export a backup first. After restoring on the new phone, open the app once so reminders are scheduled again.

---

## Coming soon

- Home screen widgets: a circular "today's progress" widget and a compact seven-day view of your top habits. Tapping a widget opens the app.

---

## For developers

StoneStreak is built with Expo and React Native.

| Area          | Technology                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------ |
| App framework | Expo (SDK 57), React Native 0.86, React 19                                                 |
| Navigation    | Expo Router (file-based routes, bottom tabs and modals)                                    |
| State         | Zustand                                                                                    |
| Storage       | SQLite (`expo-sqlite`) for habits and history, key-value store for settings                |
| Notifications | `expo-notifications`                                                                       |
| Charts        | `react-native-svg`                                                                         |
| Gestures      | `react-native-gesture-handler`, `react-native-reanimated`, `react-native-reorderable-list` |
| Icons         | `lucide-react-native`                                                                      |
| Language      | TypeScript (strict)                                                                        |

### Project layout

```
src/
  app/          Thin route files that only render a screen
  screens/      Every full screen (Today, Habits, Analytics, Settings, ...)
  components/   Reusable pieces (habit rows, heat map, settings rows, ...)
  hooks/        useTheme, reminder sync, notification taps, onboarding
  store/        Zustand stores (habits, settings, theme, today)
  lib/          Database, backup, streaks, analytics, dates, notifications
  theme/        Colors and the habit color palette
  types/        Shared TypeScript types
```

### Getting started

```powershell
npm install
npx expo run:android      # first time, builds the development app
npx expo start --dev-client
```

Notifications and other native features need a real build, so Expo Go is not supported.

### Useful commands

```powershell
npm run typecheck   # TypeScript check
npm run lint        # lint
npm run format      # format with Prettier
npx expo-doctor     # check dependencies and config
```

### Release build

```powershell
eas build --platform android --profile preview      # installable APK for testing
eas build --platform android --profile production   # app bundle for the Play Store
```

---

## License

See the `LICENSE` file in this repository.
