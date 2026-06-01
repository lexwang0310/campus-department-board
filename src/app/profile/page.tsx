'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { clientAPI, Post } from '@/lib/supabase';
import { User, MessageSquare, Star, Settings, ChevronRight, PenTool, Database, Heart, Sparkles, LogOut, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_AVATAR_SEEDS = [
  { name: '学霸师兄', seed: 'academic_star' },
  { name: '小助手', seed: 'helper_assistant' },
  { name: '职协学姐', seed: 'career_guide' },
  { name: '快乐学妹', seed: 'happy_girl' },
  { name: '代码大神', seed: 'coder_genius' },
  { name: '科研星人', seed: 'research_explorer' }
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'posts' | 'favorites' | 'settings'>('posts');
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myFavs, setMyFavs] = useState<Post[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // 设置表单
  const [nickname, setNickname] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);
  
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // 拦截游客
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else {
      setNickname(user.nickname);
      if (user.avatar_url.includes('seed=')) {
        const seed = user.avatar_url.split('seed=')[1];
        setAvatarSeed(seed);
        setUseCustomAvatar(false);
      } else {
        setCustomAvatarUrl(user.avatar_url);
        setUseCustomAvatar(true);
      }
    }
  }, [user, router]);

  // 加载用户的帖子和收藏
  useEffect(() => {
    async function loadUserLists() {
      if (!user) return;
      setLoadingLists(true);
      try {
        // 1. 获取我的发帖
        const allPosts = await clientAPI.posts.list();
        const userPosts = allPosts.filter(p => p.author_id === user.id);
        setMyPosts(userPosts);

        // 2. 获取我的收藏
        const userFavs = await clientAPI.favorites.listUserFavorites();
        setMyFavs(userFavs);
      } catch (err) {
        console.error('Error loading profile lists:', err);
      } finally {
        setLoadingLists(false);
      }
    }
    loadUserLists();
  }, [user, activeTab]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError(null);
    setUpdating(true);

    let avatarUrl = '';
    if (useCustomAvatar) {
      if (!customAvatarUrl.trim()) {
        setUpdateError('请输入自定义头像的 URL 链接');
        setUpdating(false);
        return;
      }
      avatarUrl = customAvatarUrl;
    } else {
      avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed || 'student'}`;
    }

    try {
      const success = await updateProfile(nickname, avatarUrl);
      if (success) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 2000);
      } else {
        setUpdateError('保存修改失败，请重试');
      }
    } catch (e: any) {
      setUpdateError(e.message || '修改个人资料时出错');
    } finally {
      setUpdating(false);
    }
  };

  const getPresetAvatarUrl = (seed: string) => {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
  };

  // 格式化时间
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* 个人头部名片卡 */}
      <div className="glass-panel border-slate-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <img
              src={user.avatar_url}
              alt={user.nickname}
              className="h-20 w-20 rounded-full border-2 border-indigo-500 bg-slate-900 shadow-xl"
            />
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                校园认证学者
              </div>
              <h2 className="title-font text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {user.nickname}
              </h2>
              <p className="text-xs text-slate-400 font-medium">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              signOut();
              router.push('/auth');
            }}
            className="flex items-center gap-2 px-4 py-2 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold text-rose-400 shadow-sm transition-all duration-300 active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            注销登录
          </button>
        </div>
      </div>

      {/* 左右分栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* 左侧菜单 Tab 面板 */}
        <div className="lg:col-span-1 glass-panel border border-slate-800/40 p-4 rounded-2xl space-y-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold w-full transition-all ${
              activeTab === 'posts'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>我的帖子 ({myPosts.length})</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-70" />
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold w-full transition-all ${
              activeTab === 'favorites'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>我的收藏 ({myFavs.length})</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-70" />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold w-full transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold scale-[1.01]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>账号设置</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-70" />
          </button>
        </div>

        {/* 右侧列表和表单展示区 */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="title-font text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                  我发表的留言贴
                </h3>
                {loadingLists ? (
                  <div className="h-32 rounded-2xl bg-slate-900/30 animate-pulse border border-slate-900" />
                ) : myPosts.length > 0 ? (
                  myPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block glass-card rounded-2xl p-5 border border-slate-850"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-slate-500">
                          发表于 {formatTime(post.created_at)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {post.category}
                        </span>
                      </div>
                      <h4 className="title-font text-sm sm:text-base font-bold text-white mb-2 line-clamp-1 hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {post.content.replace(/[#*`>]/g, '')}
                      </p>
                      <div className="flex gap-4 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-0.5"><Heart className="h-3.5 w-3.5" /> {post.like_count} 点赞</span>
                        <span className="flex items-center gap-0.5"><MessageSquare className="h-3.5 w-3.5" /> {post.comment_count} 评论</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="glass-panel border-slate-900 rounded-2xl p-10 text-center text-xs text-slate-500 space-y-4">
                    <p>您还没有发表过任何留言帖，快去分享你的第一篇经验吧！</p>
                    <Link
                      href="/posts/new"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 shadow-lg transition-all"
                    >
                      <PenTool className="h-4 w-4" />
                      去发表新贴
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="title-font text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-indigo-400" />
                  我的学术收藏夹
                </h3>
                {loadingLists ? (
                  <div className="h-32 rounded-2xl bg-slate-900/30 animate-pulse border border-slate-900" />
                ) : myFavs.length > 0 ? (
                  myFavs.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block glass-card rounded-2xl p-5 border border-slate-850"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.author?.avatar_url}
                            alt={post.author?.nickname}
                            className="h-5 w-5 rounded-full border border-slate-850 bg-slate-800"
                          />
                          <span className="text-[10px] font-bold text-slate-400">
                            @{post.author?.nickname || '同学'}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {post.category}
                        </span>
                      </div>
                      <h4 className="title-font text-sm sm:text-base font-bold text-white mb-2 line-clamp-1 hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {post.content.replace(/[#*`>]/g, '')}
                      </p>
                      <div className="flex gap-4 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-0.5"><Heart className="h-3.5 w-3.5" /> {post.like_count} 点赞</span>
                        <span className="flex items-center gap-0.5"><MessageSquare className="h-3.5 w-3.5" /> {post.comment_count} 评论</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="glass-panel border-slate-900 rounded-2xl p-10 text-center text-xs text-slate-500">
                    <p className="italic">学术收藏夹空空如也。在帖子详情页点击 “收藏” 按钮以保存有价值的留言！</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h3 className="title-font text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-indigo-400" />
                  修改账号资料
                </h3>

                <form onSubmit={handleProfileSubmit} className="glass-panel border-slate-900 p-6 rounded-2xl space-y-6">
                  {updateSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-xs font-semibold text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 animate-bounce" />
                      修改资料成功！修改已即时在全局生效。
                    </div>
                  )}

                  {updateError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/25 text-xs font-semibold text-rose-400">
                      {updateError}
                    </div>
                  )}

                  {/* 昵称 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      我的留言板昵称
                    </label>
                    <input
                      type="text"
                      required
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="设置你的昵称..."
                      className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* 头像选择 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                        设置账户头像
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseCustomAvatar(!useCustomAvatar)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {useCustomAvatar ? '使用极美学术预设头像' : '输入自定义头像链接'}
                      </button>
                    </div>

                    {useCustomAvatar ? (
                      <input
                        type="url"
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        placeholder="请输入您的自定义头像 URL 链接..."
                        className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[11px] text-slate-500">
                          我们为您精选了六款风格唯美、契合学术氛围的角色头像：
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                          {PRESET_AVATAR_SEEDS.map((avatar) => {
                            const isSelected = avatarSeed === avatar.seed;
                            return (
                              <button
                                key={avatar.seed}
                                type="button"
                                onClick={() => setAvatarSeed(avatar.seed)}
                                className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                                  isSelected
                                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 font-bold scale-102'
                                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800'
                                }`}
                              >
                                <img
                                  src={getPresetAvatarUrl(avatar.seed)}
                                  alt={avatar.name}
                                  className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-full mb-1"
                                />
                                <span className="text-[9px]">{avatar.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 保存按钮 */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
                    >
                      {updating ? '正在保存...' : '保存个人资料修改'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
