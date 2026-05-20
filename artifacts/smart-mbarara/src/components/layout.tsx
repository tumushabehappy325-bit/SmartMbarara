import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ShieldCheck, LogIn, Menu, X, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Public Reports", href: "/reports" },
  ];

  const isAdmin = location.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <ShieldCheck className="h-6 w-6 text-sidebar-primary mr-2" />
            <span className="font-serif font-bold text-lg text-sidebar-foreground">Smart Mbarara</span>
          </div>
          <nav className="flex-1 py-4 px-3 space-y-1">
            <Link href="/admin" className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md", location === "/admin" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
              Dashboard
            </Link>
            <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground mt-8">
              Back to Public Site
            </Link>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-4 sm:px-6 lg:px-8 md:hidden">
            <div className="flex items-center">
              <ShieldCheck className="h-6 w-6 text-primary mr-2" />
              <span className="font-serif font-bold text-lg text-foreground">Admin</span>
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="bg-primary border-b border-primary-border sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex flex-shrink-0 items-center">
                <ShieldCheck className="h-8 w-8 text-secondary" />
                <span className="ml-2 font-serif font-bold text-xl text-primary-foreground">Smart Mbarara</span>
              </Link>
              <nav className="hidden md:ml-8 md:flex md:space-x-1 items-center">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location === item.href
                        ? "bg-primary-foreground/10 text-primary-foreground"
                        : "text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/report">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Report Issue
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/admin">
                  <LogIn className="mr-2 h-4 w-4" />
                  Staff Login
                </Link>
              </Button>
            </div>
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-primary border-t border-primary-foreground/10 pb-3 pt-2">
            <div className="space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    location === item.href
                      ? "bg-primary-foreground/10 text-primary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 border-t border-primary-foreground/10">
                <Link href="/report" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-start mb-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Report Issue
                  </Button>
                </Link>
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <LogIn className="mr-2 h-4 w-4" />
                    Staff Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 bg-background">
        {children}
      </main>
      <footer className="bg-primary border-t border-primary-border py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <ShieldCheck className="h-6 w-6 text-secondary" />
            <span className="ml-2 font-serif font-bold text-lg text-primary-foreground">Smart Mbarara</span>
          </div>
          <p className="text-sm text-primary-foreground/60">
            &copy; {new Date().getFullYear()} Mbarara City Council. Civic Issue Reporting System.
          </p>
        </div>
      </footer>
    </div>
  );
}
