'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { clientAPI } from '@/lib/supabase';
import { PenTool, Eye, Image as ImageIcon, Sparkles, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  '课程讨论',
  '考试经验',
  '实习就业',
  '竞赛活动',
  '资源分享',
  '院系通知',
  '其他'
];

// 高质量学术/校园学术配图种子，根据分类自动匹配，提高视觉高级感
const PRESET_IMAGES: Record<string, string> = {
  '课程讨论': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
  '考试经验': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60',
  '实习就业': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60',
  '竞赛活动': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=60',
  '资源分享': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=60',
  '院系通知': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=60',
  '其他': 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?w=800&auto=format&fit=crop&q=60'
};

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('课程讨论');
  
  const [imageUrl, setImageUrl] = useState('');
  const [customImage, setCustomImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 拦截未登录用户
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  // 根据分类自动更新默认的流光配图预览
  useEffect(() => {
    if (!customImage) {
      setImageUrl(PRESET_IMAGES[category]);
      setImagePreview(PRESET_IMAGES[category]);
    }
  }, [category, customImage]);

  const handleCustomImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('请输入留言帖标题');
      return;
    }

    if (!content.trim()) {
      setErrorMsg('请输入留言帖正文内容');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await clientAPI.posts.create(
        title,
        content,
        category,
        imageUrl || undefined
      );

      if (error) {
        setErrorMsg(String(error));
        setIsSubmitting(false);
      } else {
        // 成功！触发炫酷的全屏彩带散开动效！
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#3b82f6', '#10b981']
        });

        // 稍微延时跳转，以便享受微动效
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '发布失败，请重试');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-6 group transition-colors"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        返回留言板
      </button>

      {/* 头部标题区 */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs text-purple-400 font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          知识互助，点亮灵感
        </div>
        <h1 className="title-font text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          发布新留言帖
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          支持 Markdown 语法排版，优质的内容会吸引更多同学点赞和讨论。
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm font-semibold text-rose-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {errorMsg}
        </div>
      )}

      {/* 主体编辑表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 第一行：标题与分类 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              留言帖标题 (Title) *
            </label>
            <input
              type="text"
              required
              placeholder="一句话简述你的问题、分享或通知（如：【选课避坑】大二《计网》期末生存宝典）"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              选择分类 *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-950 text-slate-300">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 封面配图配置 */}
        <div className="glass-panel border-slate-900 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-indigo-400" />
              帖子封面配图 (Optional)
            </h3>
            <button
              type="button"
              onClick={() => setCustomImage(!customImage)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {customImage ? '使用系统匹配学术背景图' : '上传/使用自定义图片链接'}
            </button>
          </div>

          {customImage ? (
            <input
              type="url"
              placeholder="请输入您希望展示的封面图片链接 (https://...)"
              value={imageUrl}
              onChange={handleCustomImageUrlChange}
              className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          ) : (
            <p className="text-[11px] text-slate-500">
              系统已根据您的分类自动配对了一张极具学术/校园氛围的高画质 Unsplash 插图，发帖后将自动展示。
            </p>
          )}

          {/* 配图预览 */}
          {imagePreview && (
            <div className="max-h-40 overflow-hidden rounded-xl border border-slate-800/60 relative group">
              <img
                src={imagePreview}
                alt="配图预览"
                className="w-full object-cover opacity-80"
                onError={() => setImagePreview('')}
              />
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white/90 bg-slate-900/60 px-3 py-1 rounded-full border border-white/10 font-medium">
                  配图预览
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 内容编辑器 (包含 Tab 切换 Markdown 预览) */}
        <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/20">
          {/* 编辑器顶部导航 */}
          <div className="flex justify-between items-center bg-slate-950/60 border-b border-slate-800/60 px-4 py-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'edit'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PenTool className="h-3.5 w-3.5" />
                正文编辑
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                实时预览
              </button>
            </div>
            
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              使用标准 Markdown 语法排版
            </span>
          </div>

          {/* 编辑区/预览区容器 */}
          <div className="min-h-[350px] p-4 bg-slate-900/10">
            {activeTab === 'edit' ? (
              <textarea
                required
                placeholder="在此输入您的内容。支持 Markdown 排版。

例如：
### 1. 第一点
写下你的详细经验与心得...

- **重点加粗**：强调你希望师弟师妹注意的细节。
- *引用*：你可以通过 > 来插入引用内容。
- [参考链接](https://example.edu.cn)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[330px] bg-transparent text-slate-200 placeholder-slate-650 text-sm focus:outline-none resize-y leading-relaxed font-sans"
              />
            ) : (
              <div className="prose prose-invert max-w-none min-h-[330px] prose-dark">
                {content.trim() ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="text-slate-650 italic text-sm">还没有输入任何内容，预览区空空如也...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 底部发布动作 */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-900">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-slate-800 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all duration-200"
          >
            取消
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:brightness-115 active:scale-98 transition-all disabled:opacity-50"
          >
            {isSubmitting ? '正在发布...' : '确认发布留言'}
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
