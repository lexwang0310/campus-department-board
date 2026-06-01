'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, User, ShieldCheck, ArrowRight, Sparkles, Database } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { user, signIn, signUp, loading, isMock } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 如果已经登录，直接跳回首页
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg('请输入您的校园邮箱');
      return;
    }

    if (!isLogin && !nickname) {
      setErrorMsg('请设置您的留言板昵称');
      return;
    }

    setSubmitLoading(true);

    try {
      if (isLogin) {
        const res = await signIn(email);
        if (res.success) {
          setSuccessMsg('登录成功！正在跳转...');
          setTimeout(() => router.push('/'), 1200);
        } else {
          setErrorMsg(res.error || '登录失败，请检查邮箱');
        }
      } else {
        const res = await signUp(email, nickname);
        if (res.success) {
          setSuccessMsg('注册并登录成功！正在为您开启校园看板...');
          setTimeout(() => router.push('/'), 1500);
        } else {
          setErrorMsg(res.error || '注册失败');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || '操作失败，请重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 一键填充调试账号（极致的易用性与体验）
  const handleQuickLogin = async (presetEmail: string, presetNickname?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitLoading(true);
    
    try {
      if (presetNickname) {
        // 注册新演示账号
        const res = await signUp(presetEmail, presetNickname);
        if (res.success) {
          setSuccessMsg(`已为您快速注册并登录测试账号：${presetNickname}`);
          setTimeout(() => router.push('/'), 1200);
        } else {
          // 如果已存在则直接登录
          const loginRes = await signIn(presetEmail);
          if (loginRes.success) {
            setSuccessMsg('一键测试账号登录成功！');
            setTimeout(() => router.push('/'), 1200);
          } else {
            setErrorMsg(loginRes.error);
          }
        }
      } else {
        // 直接登录已有的
        const res = await signIn(presetEmail);
        if (res.success) {
          setSuccessMsg('一键测试账号登录成功！');
          setTimeout(() => router.push('/'), 1200);
        } else {
          setErrorMsg(res.error);
        }
      }
    } catch (e: any) {
      setErrorMsg('一键登录失败，请手动输入');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10 relative">
      {/* 炫光背景圆 */}
      <div className="absolute w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[80px] -z-10 animate-pulse" />
      
      <div className="w-full max-w-md glass-panel glow-border rounded-3xl p-8 shadow-2xl relative">
        {/* 卡片顶部流光 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl" />
        
        {/* 顶部标题与形态切换 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            开启学术交流与知识沉淀
          </div>
          <h2 className="title-font text-3xl font-extrabold text-white tracking-tight">
            {isLogin ? '欢迎回来' : '加入留言板'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isLogin ? '使用校园邮箱登录您的学术讨论板' : '注册即刻参与全院信息共享'}
          </p>
        </div>

        {/* 表单切换 Tab */}
        <div className="flex bg-slate-950/60 p-1 rounded-2xl mb-6 border border-slate-800/60">
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(null); }}
            className={`flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all duration-300 ${
              isLogin 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            邮箱登录
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(null); }}
            className={`flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all duration-300 ${
              !isLogin 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            邮箱注册
          </button>
        </div>

        {/* 提示栏 */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 animate-shake">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 animate-pulse">
            {successMsg}
          </div>
        )}

        {/* 认证表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              校园邮箱 (Email Address)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@university.edu.cn"
                className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                留言板昵称 (Nickname)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="学术达人 / 院系小蜜蜂"
                  className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitLoading || loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-indigo-600/30 hover:brightness-115 active:scale-98 transition-all disabled:opacity-50"
          >
            {submitLoading ? '请稍候...' : isLogin ? '验证登录' : '立即注册'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* 调试专用快捷登录栏 */}
        <div className="mt-8 pt-6 border-t border-slate-900">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1 uppercase tracking-widest">
              <ShieldCheck className="h-3.5 w-3.5" />
              开发者 / 评测专用一键通道
            </span>
            {isMock && (
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1 flex items-center gap-0.5">
                <Database className="h-2 w-2" /> Mock DB
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            如果您希望快速评估应用的各项交互和核心功能（如发帖、点赞、评论等），我们为您准备了预设的极速体验测试账户：
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('demo_user_1@university.edu.cn', '学术探索者')}
              className="py-2 px-3 text-xs bg-slate-950/60 hover:bg-indigo-500/15 border border-slate-800/80 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 font-semibold rounded-xl text-left transition-all duration-200"
            >
              🚀 演示账户 1
              <span className="block text-[9px] text-slate-600 hover:text-indigo-400/60 font-medium">@学术探索者</span>
            </button>
            <button
              onClick={() => handleQuickLogin('demo_user_2@university.edu.cn', '科研干饭人')}
              className="py-2 px-3 text-xs bg-slate-950/60 hover:bg-purple-500/15 border border-slate-800/80 hover:border-purple-500/30 text-slate-300 hover:text-purple-300 font-semibold rounded-xl text-left transition-all duration-200"
            >
              ⚡ 演示账户 2
              <span className="block text-[9px] text-slate-600 hover:text-purple-400/60 font-medium">@科研干饭人</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
