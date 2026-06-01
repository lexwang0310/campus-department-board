'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { clientAPI, Post, Comment } from '@/lib/supabase';
import { Heart, Star, CornerDownRight, Trash2, ArrowLeft, Send, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // 状态交互
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 输入表单
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // 加载数据
  useEffect(() => {
    async function loadPostData() {
      if (!postId) return;
      setLoading(true);
      try {
        const postData = await clientAPI.posts.getById(postId);
        if (!postData) {
          setErrorMsg('未找到该留言帖子');
          setLoading(false);
          return;
        }
        setPost(postData);
        setLikeCount(postData.like_count);

        // 加载点赞/收藏状态
        if (user) {
          const likedStatus = await clientAPI.likes.getStatus(postId);
          const favStatus = await clientAPI.favorites.getStatus(postId);
          setIsLiked(likedStatus);
          setIsFavorited(favStatus);
        }

        // 加载评论
        const commentsData = await clientAPI.comments.listForPost(postId);
        setComments(commentsData);
      } catch (err) {
        console.error('Error loading post:', err);
        setErrorMsg('加载留言数据出错');
      } finally {
        setLoading(false);
      }
    }
    loadPostData();
  }, [postId, user]);

  // 点赞事件
  const handleLike = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    try {
      const { liked, count, error } = await clientAPI.likes.toggle(postId);
      if (!error) {
        setIsLiked(liked);
        setLikeCount(count);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 收藏事件
  const handleFavorite = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    try {
      const { favorited, error } = await clientAPI.favorites.toggle(postId);
      if (!error) {
        setIsFavorited(favorited);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 删除帖子事件
  const handleDeletePost = async () => {
    if (!window.confirm('您确定要永久删除这篇留言帖吗？此操作无法撤销。')) return;
    try {
      const { success, error } = await clientAPI.posts.delete(postId);
      if (success) {
        router.push('/');
      } else {
        alert(error || '删除失败');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 提交主评论
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth');
      return;
    }
    if (!newCommentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await clientAPI.comments.create(postId, newCommentContent);
      if (!error && data) {
        setNewCommentContent('');
        // 刷新评论列表
        const refreshed = await clientAPI.comments.listForPost(postId);
        setComments(refreshed);
        
        // 增加帖子的评论数显示
        if (post) {
          setPost({ ...post, comment_count: post.comment_count + 1 });
        }
      } else {
        setErrorMsg(error || '提交评论失败');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  // 提交子回复
  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth');
      return;
    }
    if (!replyContent.trim()) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await clientAPI.comments.create(postId, replyContent, parentId);
      if (!error && data) {
        setReplyContent('');
        setReplyToId(null);
        // 刷新评论列表
        const refreshed = await clientAPI.comments.listForPost(postId);
        setComments(refreshed);

        // 增加帖子的评论数显示
        if (post) {
          setPost({ ...post, comment_count: post.comment_count + 1 });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  // 删除评论事件
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('确定删除您的这条评论吗？')) return;
    try {
      const { success, error } = await clientAPI.comments.delete(commentId);
      if (success) {
        const refreshed = await clientAPI.comments.listForPost(postId);
        setComments(refreshed);

        // 减少帖子的评论数显示
        if (post) {
          setPost({ ...post, comment_count: Math.max(0, post.comment_count - 1) });
        }
      } else {
        alert(error || '删除失败');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 格式化时间
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8 animate-pulse">
        <div className="h-6 w-24 bg-slate-800 rounded" />
        <div className="h-10 w-3/4 bg-slate-800 rounded" />
        <div className="h-4 w-1/3 bg-slate-800 rounded" />
        <div className="h-64 w-full bg-slate-850 rounded-2xl" />
      </div>
    );
  }

  if (errorMsg || !post) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="title-font text-xl font-bold text-white">帖子加载失败</h2>
        <p className="text-xs text-slate-400">{errorMsg || '帖子不存在'}</p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          返回首页看板
        </button>
      </div>
    );
  }

  // 渲染单条评论卡片
  const renderComment = (comment: Comment, isReply = false) => {
    const isCommentAuthor = user && user.id === comment.user_id;
    return (
      <div
        key={comment.id}
        className={`p-4 rounded-2xl border transition-all duration-300 ${
          isReply 
            ? 'bg-slate-950/30 border-slate-900 pl-4 ml-6 sm:ml-10 relative mt-3' 
            : 'bg-slate-900/10 border-slate-850/60 mt-4'
        }`}
      >
        {isReply && (
          <div className="absolute top-4 left-[-20px] sm:left-[-24px] text-slate-700">
            <CornerDownRight className="h-4 w-4" />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          {/* 左侧头像与发布人 */}
          <div className="flex items-center gap-2.5">
            <img
              src={comment.user?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.user_id}`}
              alt={comment.user?.nickname}
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-slate-800 bg-slate-800"
            />
            <div>
              <span className="text-xs font-bold text-slate-300">
                {comment.user?.nickname || '匿名用户'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {formatTime(comment.created_at)}
              </span>
            </div>
          </div>

          {/* 右侧动作按钮 */}
          <div className="flex items-center gap-2">
            {!isReply && (
              <button
                onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 rounded-lg px-2.5 py-1 transition-all"
              >
                回复
              </button>
            )}
            
            {isCommentAuthor && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="删除评论"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 评论内容 */}
        <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pl-1">
          {comment.content}
        </p>

        {/* 回复输入框（当且仅当点击了此回复按钮） */}
        {replyToId === comment.id && (
          <form
            onSubmit={(e) => handleReplySubmit(e, comment.id)}
            className="mt-4 flex gap-2 animate-in slide-in-from-top-2 duration-200"
          >
            <input
              type="text"
              required
              placeholder={`回复 @${comment.user?.nickname || '同学'}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={submittingComment}
              className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
            >
              发送
              <Send className="h-3 w-3" />
            </button>
          </form>
        )}

        {/* 递归渲染子回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-1.5">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* 返回按钮 */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-6 group transition-colors"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        返回留言板首页
      </button>

      {/* 帖子文章主体 */}
      <article className="glass-panel border-slate-800/40 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* 文章大分类徽章 */}
        <span className="absolute top-6 right-6 px-3 py-0.5 rounded-full text-xs font-bold border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
          {post.category}
        </span>

        {/* 封面图 */}
        {post.image_url && (
          <div className="-mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-8 max-h-[350px] overflow-hidden border-b border-slate-800/60 relative">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent pointer-events-none" />
          </div>
        )}

        {/* 发布者基本资料 */}
        <div className="flex items-center gap-3.5 mb-6">
          <img
            src={post.author?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.author_id}`}
            alt={post.author?.nickname || '匿名'}
            className="h-10 w-10 rounded-full border border-slate-700 bg-slate-800"
          />
          <div>
            <div className="text-sm font-extrabold text-white">
              {post.author?.nickname || '匿名用户'}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{post.author?.email}</span>
              <span>•</span>
              <span>发布于 {formatTime(post.created_at)}</span>
            </div>
          </div>
        </div>

        {/* 文章标题 */}
        <h1 className="title-font text-2xl md:text-3xl font-black text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* 文章正文 Markdown 渲染 */}
        <div className="prose prose-invert max-w-none prose-dark mb-10 pb-8 border-b border-slate-900">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* 动作状态条（点赞、收藏、删除） */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 点赞 */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                isLiked
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-md shadow-rose-500/5'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Heart className={`h-4 w-4 transition-transform duration-200 ${isLiked ? 'fill-rose-400 scale-110' : ''}`} />
              {likeCount} 点赞
            </button>

            {/* 收藏 */}
            <button
              onClick={handleFavorite}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                isFavorited
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-md shadow-amber-500/5'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Star className={`h-4 w-4 transition-transform duration-200 ${isFavorited ? 'fill-amber-400 scale-110' : ''}`} />
              {isFavorited ? '已收藏' : '收藏'}
            </button>
          </div>

          {/* 发帖人删除权利 */}
          {user && user.id === post.author_id && (
            <button
              onClick={handleDeletePost}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              删除留言帖
            </button>
          )}
        </div>
      </article>

      {/* 评论大区 */}
      <section className="mt-8 space-y-6">
        <h2 className="title-font text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-400" />
          讨论留言区 ({post.comment_count})
        </h2>

        {/* 发表新评论表单 */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="glass-panel border-slate-900 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <img
                src={user.avatar_url}
                alt={user.nickname}
                className="h-5 w-5 rounded-full border border-slate-700 bg-slate-800"
              />
              <span className="text-[11px] font-bold text-slate-400">
                以 @{user.nickname} 身份参与讨论
              </span>
            </div>
            
            <div className="flex gap-2">
              <textarea
                required
                rows={2}
                placeholder="在此分享你的看法、解答作者的问题、寻找挑战杯队友..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="flex-1 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !newCommentContent.trim()}
                className="px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                发表
              </button>
            </div>
          </form>
        ) : (
          <div className="glass-panel border-slate-900 p-6 rounded-2xl text-center space-y-3.5">
            <p className="text-xs text-slate-500 font-medium">您目前处于游客模式，登录后即可参与深度探讨留言。</p>
            <button
              onClick={() => router.push('/auth')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 transition-all shadow-md shadow-indigo-600/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              一键登录参与评论
            </button>
          </div>
        )}

        {/* 评论列表 */}
        <div className="space-y-1">
          {comments.length > 0 ? (
            comments.map(c => renderComment(c))
          ) : (
            <div className="glass-panel border-slate-900/60 p-10 rounded-2xl text-center text-xs text-slate-600 italic">
              当前暂无针对此留言贴的评论。写下你的看法，开启沙发第一帖吧！
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
