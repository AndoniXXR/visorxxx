"use client";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '2px 6px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <span style={{ fontSize: 10, color: '#333' }}>🌞</span>
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        style={{ width: 22, height: 12 }}
      />
      <span style={{ fontSize: 10, color: '#333' }}>🌚</span>
    </div>
  );
}
