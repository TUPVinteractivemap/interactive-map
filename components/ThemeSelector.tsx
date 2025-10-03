'use client';

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type MapTheme = 'default' | 'floor-based' | 'blackout';

interface ThemeSelectorProps {
  currentTheme: MapTheme;
  onThemeChange: (theme: MapTheme) => void;
  className?: string;
}

export function ThemeSelector({ currentTheme, onThemeChange, className }: ThemeSelectorProps) {
  const themes: { value: MapTheme; label: string; description: string }[] = [
    {
      value: 'default',
      label: 'Default Theme',
      description: 'Color buildings by their type (Academic, Administrative, etc.)'
    },
    {
      value: 'floor-based',
      label: 'Floor-based Theme',
      description: 'Color buildings by their number of floors'
    },
    {
      value: 'blackout',
      label: 'Blackout Theme',
      description: 'Use grayscale colors for all buildings'
    }
  ];

  return (
    <div className={cn("space-y-2 py-2", className)}>
      <h3 className="font-semibold text-sm text-white mb-2">Map Theme</h3>
      <div className="flex flex-col gap-2">
        {themes.map((theme) => (
          <Button
            key={theme.value}
            variant={currentTheme === theme.value ? "secondary" : "outline"}
            className="w-full justify-start text-left"
            onClick={() => onThemeChange(theme.value)}
          >
            <div>
              <div className="text-sm font-medium">{theme.label}</div>
              <div className="text-xs text-muted-foreground">{theme.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}