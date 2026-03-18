import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Coins,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  Upload,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetUserCredits,
} from "../hooks/useQueries";

interface NavbarProps {
  onSearchChange?: (q: string) => void;
}

export default function Navbar({ onSearchChange }: NavbarProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const { data: profile } = useGetCallerUserProfile();
  const { data: credits } = useGetUserCredits();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const displayName = profile?.email?.split("@")[0] || "User";

  return (
    <header
      className="sticky top-0 z-50 bg-card border-b border-border shadow-nav"
      data-ocid="nav.panel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            data-ocid="nav.link"
          >
            <img
              src="/assets/generated/studymart-logo-transparent.dim_200x200.png"
              alt="StudyMart"
              className="w-9 h-9 object-contain"
            />
            <span className="font-display font-bold text-xl text-primary hidden sm:inline">
              StudyMart
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg hidden md:flex items-center relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes, subjects..."
              className="pl-10 bg-secondary border-0 focus-visible:ring-primary"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              data-ocid="nav.search_input"
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <>
                <Link to="/credits">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-primary/20 text-primary"
                    data-ocid="nav.credits_button"
                  >
                    <Coins className="w-4 h-4" />
                    <span className="font-semibold">
                      {credits?.toString() ?? "0"} Credits
                    </span>
                  </Button>
                </Link>
                <Link to="/upload">
                  <Button
                    size="sm"
                    className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                    data-ocid="nav.upload_button"
                  >
                    <Upload className="w-4 h-4" />
                    Sell Notes
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar
                      className="cursor-pointer ring-2 ring-primary/20 hover:ring-primary/50 transition-all w-9 h-9"
                      data-ocid="nav.profile_button"
                    >
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                        {displayName[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2"
                        data-ocid="nav.profile_link"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/purchases"
                        className="flex items-center gap-2"
                        data-ocid="nav.purchases_link"
                      >
                        <ShoppingBag className="w-4 h-4" /> My Purchases
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-destructive"
                      onClick={handleAuth}
                      data-ocid="nav.logout_button"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {!isAuthenticated && (
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                className="gap-2 bg-primary text-primary-foreground"
                data-ocid="nav.login_button"
              >
                <BookOpen className="w-4 h-4" />
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
            data-ocid="nav.toggle"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes..."
              className="pl-10 bg-secondary border-0"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                onSearchChange?.(e.target.value);
              }}
            />
          </div>
          {isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-1">
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="w-4 h-4" /> Profile
                </Button>
              </Link>
              <Link to="/purchases" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <ShoppingBag className="w-4 h-4" /> My Purchases
                </Button>
              </Link>
              <Link to="/credits" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Coins className="w-4 h-4" /> {credits?.toString() ?? "0"}{" "}
                  Credits
                </Button>
              </Link>
              <Link to="/upload" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full gap-2 bg-accent text-accent-foreground">
                  <Upload className="w-4 h-4" /> Sell Notes
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleAuth}
                className="w-full justify-start gap-2 text-destructive"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="w-full gap-2"
              data-ocid="nav.login_button"
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
