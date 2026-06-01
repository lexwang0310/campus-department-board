'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, PlusSquare, User, LogOut, Menu, X, Database } from 'lucide-react';

export default function Navbar() {
  const { user, signOut, isMock } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: '首页', href: '/', icon: MessageSquare },
    { name: '发布帖子', href: '/posts/new', icon: PlusSquare, requireAuth: true },
    { name: '个人中心', href: '/profile', icon: User, requireAuth: true },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="title-font text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
                院系留言板
              </span>
            </Link>
            {isMock && (
              <div className="ml-3 hidden md:flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs text-amber-400 font-medium animate-pulse">
                <Database className="h-3 w-3" />
                演示模式 (Mock DB)
              </div>
            )}
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.requireAuth && !user) return null;
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Profile / Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800/60 rounded-full pl-2 pr-4 py-1.5 hover:border-slate-700/80 transition-colors">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`}
                  alt={user.nickname}
                  className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700"
                />
                <span className="text-sm font-medium text-slate-300 max-w-[100px] truncate">
                  {user.nickname}
                </span>
                <button
                  onClick={signOut}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-all duration-200"
                  title="退出登录"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="glow-border relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:brightness-110 active:scale-95 transition-all duration-200"
              >
                登录 / 注册
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isMock && (
              <div className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[10px] text-amber-400 font-semibold">
                Mock DB
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-800/40 hover:text-white focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-800/60 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => {
              if (link.requireAuth && !user) return null;
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}

            {user ? (
              <div className="border-t border-slate-800/60 mt-4 pt-4 px-4">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={user.avatar_url}
                    alt={user.nickname}
                    className="h-10 w-10 rounded-full border border-slate-700 bg-slate-800"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">{user.nickname}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-base font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300"
                >
                  <LogOut className="h-5 w-5" />
                  退出登录
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-800/60 mt-4 pt-4 px-4 pb-2">
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-base font-semibold text-white shadow-lg hover:brightness-110 transition-all duration-200"
                >
                  登录 / 注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
