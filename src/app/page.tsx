"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HomeView } from "@/components/views/home-view";
import { CatalogView } from "@/components/views/catalog-view";
import { TrackingView } from "@/components/views/tracking-view";
import { DashboardView } from "@/components/dashboard-view";
import { DocsView } from "@/components/views/docs-view";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { AuthDialog } from "@/components/auth-dialog";
import { listProducts, getAppMode, getSession, clearSession } from "@/lib/store";
import type { AppMode, Order, Product, SessionUser } from "@/lib/types";
import type { CatalogTab, ViewName } from "@/lib/views";

export default function Home() {
  const [view, setView] = useState<ViewName>("home");
  const [tab, setTab] = useState<CatalogTab>("DIGITAL");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [mode, setMode] = useState<AppMode | null>(null);
  const [trackCode, setTrackCode] = useState<string | null>(null);
  const [trackKey, setTrackKey] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [s, m, ps] = await Promise.all([
        Promise.resolve(getSession()),
        getAppMode(),
        listProducts().catch(() => null),
      ]);
      if (!alive) return;
      setSession(s);
      setMode(m);
      if (ps) setProducts(ps);
      setLoadingProducts(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  function nav(v: ViewName) {
    setView(v);
    if (v !== "track") setTrackCode(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function track(code: string) {
    setTrackCode(code);
    setTrackKey((k) => k + 1);
    setView("track");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onCreated(o: Order) {
    track(o.code);
  }

  function logout() {
    clearSession();
    setSession(null);
    setView("home");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        view={view}
        onNav={nav}
        session={session}
        onLogout={logout}
        onOpenAuth={() => setAuthOpen(true)}
        mode={mode}
      />

      <main className="flex-1">
        {view === "home" && (
          <HomeView
            products={products}
            loading={loadingProducts}
            onOrder={setCheckoutProduct}
            onNav={nav}
          />
        )}
        {view === "catalog" && (
          <CatalogView
            products={products}
            loading={loadingProducts}
            tab={tab}
            onTabChange={setTab}
            onOrder={setCheckoutProduct}
          />
        )}
        {view === "track" && <TrackingView key={trackKey} initialCode={trackCode} />}
        {view === "docs" && <DocsView />}
        {view === "dashboard" && (
          <DashboardView
            session={session}
            onOpenAuth={() => setAuthOpen(true)}
            onTrack={track}
            onLogout={logout}
          />
        )}
      </main>

      <SiteFooter onNav={nav} />

      <CheckoutDialog
        product={checkoutProduct}
        onClose={() => setCheckoutProduct(null)}
        onCreated={onCreated}
      />
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={setSession} />
    </div>
  );
}
