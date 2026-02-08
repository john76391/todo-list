import { Moon, Sun, Monitor, type LucideIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import type { Theme } from "@/components/theme-provider";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type ThemeIcon = {
  theme: Theme;
  Icon: LucideIcon;
};

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const themeIcon: ThemeIcon[] = [
    {
      theme: "light",
      Icon: Sun,
    },
    {
      theme: "dark",
      Icon: Moon,
    },
    {
      theme: "system",
      Icon: Monitor,
    },
  ];

  return (
    <div className="flex w-30 items-center justify-evenly rounded-full border py-2">
      {themeIcon.map((Icon) => (
        <button
          className="relative cursor-pointer p-1"
          onClick={() => setTheme(Icon.theme)}
        >
          {theme === Icon.theme && (
            <motion.div
              layoutId="iconLayer"
              className="absolute inset-0 rounded-full bg-gray-950 dark:bg-white"
            />
          )}
          <Icon.Icon
            className={cn(
              "relative h-[1.2rem] w-[1.2rem] transition-colors duration-300",
              theme === Icon.theme && "text-white dark:text-black",
            )}
          />
          <span className="sr-only">Toggle theme</span>
        </button>
      ))}
    </div>
  );
}
