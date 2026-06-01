'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { clientAPI, Post } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Search, Flame, Clock, Heart, MessageCircle, PenTool, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  '全部',
  '课程讨论',
  '考试经验',
  '实习就业',
  '竞赛活动',
  '资源分享',
  '院系通知',
  '其他'
];

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [sortBy, setSortBy] = useState<'latest' | 'hottest'>('latest');

  // 加载帖子列表
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const data = await clientAPI.posts.list(
          selectedCategory,
          searchQuery,
          sortBy
        );
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    }
    
    // 采用防抖以优化输入搜索
    const timer = setTimeout(() => {
      fetchPosts();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, sortBy]);

  // 根据分类获取专属配色
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '课程讨论':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case '考试经验':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case '实习就业':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case '竞赛活动':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case '资源分享':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case '院系通知':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-800';
    }
  };

  // 格式化时间函数
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 头部欢迎条 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border border-slate-800/40 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs text-indigo-400 font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            全新版院系留言板已上线
          </div>
          <h1 className="title-font text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            在这里，听见<span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">院系的声音</span>
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            极简、高效、有价值的校园信息社区。无论是在寻找选课避坑指南、学长学姐考试经验，还是求职招聘第一线资讯，这里都能满足你。
          </p>
        </div>
      </div>

      {/* 搜索与过滤工具栏 */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-slate-950/40 border border-slate-900/60 p-4 rounded-2xl backdrop-blur-md">
        {/* 搜索框 */}
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="搜索留言标题、内容、经验..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* 排序切换 */}
        <div className="flex bg-slate-900/40 border border-slate-800/60 p-1 rounded-xl">
          <button
            onClick={() => setSortBy('latest')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              sortBy === 'latest'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            最新发布
          </button>
          <button
            onClick={() => setSortBy('hottest')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              sortBy === 'hottest'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            最热点赞
          </button>
        </div>
      </div>

      {/* 左右分栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* 左栏分类导航 */}
        <div className="lg:col-span-1 glass-panel border border-slate-800/40 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" />
            分类导航
          </h3>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap lg:whitespace-normal transition-all duration-200 w-full ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <span>{cat}</span>
                  <ChevronRight className={`hidden lg:block h-3.5 w-3.5 text-current opacity-70 transition-transform ${isActive ? 'translate-x-1' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* 右栏帖子流列表 */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              // 骨架屏加载状态
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="glass-panel border-slate-900 p-6 rounded-2xl space-y-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-800" />
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-slate-800 rounded" />
                        <div className="h-2 w-12 bg-slate-800 rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-2/3 bg-slate-800 rounded" />
                    <div className="space-y-2">
                      <div className="h-3.5 w-full bg-slate-800 rounded" />
                      <div className="h-3.5 w-4/5 bg-slate-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <motion.div layout className="space-y-4">
                {posts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                  >
                    <Link
                      href={`/posts/${post.id}`}
                      className="block glass-card rounded-2xl p-6 relative overflow-hidden"
                    >
                      {/* 帖子顶部作者及分类标签 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.author_id}`}
                            alt={post.author?.nickname || '匿名'}
                            className="h-8 w-8 rounded-full border border-slate-800 bg-slate-800"
                          />
                          <div>
                            <div className="text-xs font-semibold text-slate-300">
                              {post.author?.nickname || '匿名用户'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              发布于 {formatTime(post.created_at)}
                            </div>
                          </div>
                        </div>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                      </div>

                      {/* 标题与摘要 */}
                      <h2 className="title-font text-base md:text-lg font-bold text-white mb-2 leading-snug group-hover:text-indigo-300 transition-colors">
                        {post.title}
                      </h2>
                      
                      <p className="text-xs md:text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {post.content.replace(/[#*`>]/g, '')}
                      </p>

                      {/* 封面图预览 (如果有) */}
                      {post.image_url && (
                        <div className="mb-4 max-h-48 overflow-hidden rounded-xl border border-slate-800/60">
                          <img 
                            src={post.image_url} 
                            alt="封面图片" 
                            className="w-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                          />
                        </div>
                      )}

                      {/* 底部点赞评论统计 */}
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-3 border-t border-slate-900/60">
                        <span className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                          <Heart className="h-4 w-4" />
                          {post.like_count} 点赞
                        </span>
                        <span className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          {post.comment_count} 评论
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // 无数据空状态
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel rounded-2xl p-12 text-center border border-slate-850"
              >
                <div className="inline-flex rounded-full bg-slate-900 p-4 mb-4 text-slate-600">
                  <PenTool className="h-8 w-8" />
                </div>
                <h3 className="title-font text-lg font-bold text-slate-300">还没有任何留言帖</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                  {selectedCategory !== '全部' 
                    ? `当前没有 "${selectedCategory}" 分类下的帖子。`
                    : '目前讨论板上还没有留言，期待你的精彩第一帖！'}
                </p>
                {user && (
                  <Link
                    href="/posts/new"
                    className="inline-flex items-center gap-2 mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:brightness-110 transition-all"
                  >
                    <PenTool className="h-4 w-4" />
                    去发表第一篇留言
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 悬浮发帖按钮 (针对移动端及各终端快速发帖) */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          href={user ? "/posts/new" : "/auth"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 hover:scale-108 hover:brightness-110 active:scale-95 transition-all duration-300 group border border-indigo-400/20"
          title="发新留言"
        >
          <PenTool className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}
