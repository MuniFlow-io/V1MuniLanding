"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/AuthProvider";
import { authApi } from "@/modules/auth/api/authApi";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/credibility", label: "About" },
  { href: "/building", label: "What We're Building" },
  { href: "/bond-generator", label: "Bond Generator" },
  { href: "/contact", label: "Reach Out" },
];

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuth();
  
  const handleSignOut = async () => {
    await authApi.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl font-semibold text-white hover:text-cyan-400 transition-colors duration-150"
          >
            Muni<span className="text-cyan-400">Flow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-gray-400",
                  "hover:text-cyan-400",
                  "transition-colors duration-150",
                  "relative group"
                )}
              >
                {link.label}
                {/* Underline on hover */}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-200 shadow-sm shadow-cyan-400/50" />
              </Link>
            ))}
            
            {/* Auth UI */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-900/20 border border-cyan-700/30 text-cyan-400 hover:bg-cyan-900/30 transition-colors"
                >
                  <User size={16} />
                  <span className="text-sm">{user.email}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="px-4 py-2 rounded-lg bg-cyan-900/20 border border-cyan-700/30 text-cyan-400 hover:bg-cyan-900/30 transition-colors text-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-cyan-400 transition-colors duration-150"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-400 hover:text-cyan-400 transition-colors duration-150 py-2"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Auth */}
            <div className="border-t border-gray-800 pt-3 mt-3">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-cyan-400 mb-2">
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-cyan-400 hover:bg-cyan-900/20 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
