"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AppMode, SessionUser } from "@/lib/types";
import type { ViewName } from "@/lib/views";
import { cn } from "@/lib/utils";

const NAV: { key: ViewName; label: string }[] = [
  { key: "home", label: "Beranda" },
  { key: "catalog", label: "Katalog" },
  { key: "track", label: "Cek Pesanan" },
  { key: "docs", label: "API Docs" },
];

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-amber-400 shadow-sm",
        className
      )}
      aria-hidden="true"
    >
      <Zap className="h-4.5 w-4.5 text-zinc-950" strokeWidth={2.5} />
    </span>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Ganti tema"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-full"
    >
      <Sun className="hidden h-4.5 w-4.5 dark:block" />
      <Moon className="h-4.5 w-4.5 dark:hidden" />
    </Button>
  );
}

export function SiteHeader({
  view,
  onNav,
  session,
  onLogout,
  onOpenAuth,
  mode,
}: {
  view: ViewName;
  onNav: (v: ViewName) => void;
  session: SessionUser | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  mode: AppMode | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navList = (
    <nav className="flex items-center gap-1" aria-label="Navigasi utama">
      {NAV.map((item) => (
        <Button
          key={item.key}
          variant={view === item.key ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "rounded-full",
            view === item.key ? "font-semibold text-primary" : "text-muted-foreground"
          )}
          onClick={() => {
            onNav(item.key);
            setMobileOpen(false);
          }}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <button
          className="flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => onNav("home")}
          aria-label="RizqiNa Store — ke beranda"
        >
          <LogoMark />
          <span className="text-left leading-none">
            <span className="block text-[15px] font-bold tracking-tight">
              RizqiNa <span className="text-gradient">Store</span>
            </span>
            <span className="block text-[10px] font-medium text-muted-foreground">
              digital · top-up · smm
            </span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-2">{navList}</div>

        <div className="flex items-center gap-1.5">
          {mode && (
            <Badge
              variant="outline"
              className="hidden lg:inline-flex gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-500"
              title={
                mode === "fullstack"
                  ? "Backend API + database aktif"
                  : "Versi statis: data demo tersimpan lokal di browser"
              }
            >
              {mode === "fullstack" ? "API aktif" : "mode demo"}
            </Badge>
          )}
          <ThemeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 rounded-full pl-1 pr-2.5">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/20 text-[11px] font-bold text-primary">
                      {session.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
                    {session.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  @{session.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNav("dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNav("track")}>Cek Pesanan</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={onLogout}
                >
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="rounded-full font-semibold"
              onClick={onOpenAuth}
            >
              Masuk / Daftar
            </Button>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full" aria-label="Buka menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="rounded-b-3xl border-border/60">
              <SheetHeader className="items-start">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <LogoMark className="h-7 w-7" /> RizqiNa Store
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1.5 px-4 pb-6">{navList}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export { LogoMark };
