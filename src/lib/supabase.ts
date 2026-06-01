import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------
// TypeScript 接口定义
// ----------------------------------------------------
export interface Profile {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
  like_count: number;
  comment_count: number;
  image_url?: string;
  created_at: string;
  author?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  user?: Profile;
  replies?: Comment[];
}

export interface Favorite {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

// ----------------------------------------------------
// Supabase 客户端配置
// ----------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// 兼容标准的 ANON_KEY 和用户提供的 PUBLISHABLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && !supabaseAnonKey.startsWith('your_'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ----------------------------------------------------
// Mock 演示模式数据库（存储于 LocalStorage，无网络时自动激活）
// ----------------------------------------------------
const MOCK_PROFILES_KEY = 'campus_board_mock_profiles';
const MOCK_POSTS_KEY = 'campus_board_mock_posts';
const MOCK_COMMENTS_KEY = 'campus_board_mock_comments';
const MOCK_FAVORITES_KEY = 'campus_board_mock_favorites';
const MOCK_LIKES_KEY = 'campus_board_mock_likes';
const CURRENT_USER_KEY = 'campus_board_current_user';

// 预设的高质量学术/校园学术生活种子数据
const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'user-prof-1',
    email: 'academic_star@university.edu.cn',
    nickname: '学霸师兄',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=academic_star',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-prof-2',
    email: 'helper_assistant@university.edu.cn',
    nickname: '院系小助手',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=helper_assistant',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-prof-3',
    email: 'career_guide@university.edu.cn',
    nickname: '职协学姐',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=career_guide',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_POSTS: Post[] = [
  {
    id: 'post-1',
    title: '【选课避坑】计算机系大二《算法与数据结构》保姆级生存指南',
    content: `各位师弟师妹好！看到最近大家都在选课，特地写下这篇**《数据结构》生存指南**。

### 1. 师资推荐
- **张教授**：讲课偏向理论，板书超级牛，期末闭卷，推导很多。如果想考研或者扎实数理逻辑，力荐！
- **李副教授**：侧重工程实践，大作业是手写一个红黑树或图的路径搜索，期末开卷，注重代码实现。

### 2. 避坑要点
- 不要堆积大作业！每次实验课都有测评，建议每周跟着 LeetCode 刷 5-10 题相关专题（链表、栈、二叉树）。
- 强烈推荐预习书籍：程杰的《大话数据结构》或者网上的《Hello 算法》，通俗易懂！

### 3. 复习资料分享
我整理了历年期末模拟题与参考答案，已经上传到了我的收藏/分享中，欢迎交流！`,
    category: '课程讨论',
    author_id: 'user-prof-1',
    like_count: 48,
    comment_count: 5,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post-2',
    title: '【学术经验】如何备考研究生免修英语考试 (高分通过秘籍)',
    content: `每年的研究生英语免修考试难度大概介于 **CET-6** 与 **IELTS 6.5** 之间。

主要考察阅读理解与学术写作。这里分享三点核心经验：
1. **词汇量是核心**：高频学术词汇（AWL表）一定要背熟，写论文和阅读都极大加分。
2. **写作模板化**：熟练掌握“提出观点-论据支撑-反例驳斥-总结陈词”的四段式写法。
3. **听力真题**：多听 BBC / Scientific American 60-Second Science，提高语速适应度。

祝大家都能轻松免修，多出点时间做科研！`,
    category: '考试经验',
    author_id: 'user-prof-1',
    like_count: 32,
    comment_count: 2,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post-3',
    title: '【实习求职】腾讯2026暑期实习后台开发岗五轮面经整理',
    content: `刚刚拿到腾讯后台开发的 Offer，来给院系的小伙伴们回馈一波热乎的面经！

### 面试轮次
- **一、二面（技术深挖）**：侧重 OS 原理、计算机网络（TCP三次握手及状态转移、拥塞控制）、MySQL 索引原理（B+树与红黑树对比、隔离级别及死锁防护）。
- **三面（系统设计）**：设计一个高并发的院系抢课系统。考察 Redis 缓存一致性、消息队列削峰、分布式锁。
- **四面（面委会/交叉面）**：手撕代码题（LRU缓存实现、三数之和）。
- **五面（HR面）**：个人职业规划、团队合作冲突解决等。

### 关键建议
院系的算法课和计网课极其重要，面试官问得非常细致，千万不要只背八股文，一定要理解底层原理！`,
    category: '实习就业',
    author_id: 'user-prof-3',
    like_count: 56,
    comment_count: 8,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post-4',
    title: '【院系通知】第十一届“挑战杯”大学生创业计划竞赛校内选拔启动',
    content: `各位同学，第十一届“挑战杯”校内选拔赛已正式启动！

- **申报截止日期**：本月25日
- **参赛对象**：全体在校本科生、研究生
- **本院扶持**：院里将为进入校赛的团队提供专属导师指导及3000元初期路演经费补贴。

欢迎有创意的同学抓紧组队！如有组队需求，可在本帖下方留言寻找队友（请注明你的专业、擅长领域，如算法、运营、PPT美化等）。`,
    category: '院系通知',
    author_id: 'user-prof-2',
    like_count: 14,
    comment_count: 4,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    post_id: 'post-1',
    user_id: 'user-prof-3',
    content: '学姐强烈推荐李老师！李老师的大作业虽然累，但是写完以后对红黑树和二叉平衡树的理解会上一个大台阶，面试被问到根本不慌。',
    created_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment-2',
    post_id: 'post-1',
    user_id: 'user-prof-2',
    content: '感谢学霸师兄的无私分享！请问复习资料可以发我一份吗？邮箱是 test@example.com，感恩！',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment-3',
    post_id: 'post-1',
    user_id: 'user-prof-1',
    parent_id: 'comment-2',
    content: '没问题，你直接在帖子顶部的复习资料分享链接中就能下载，我已经上传至公开网盘了哈！',
    created_at: new Date(Date.now() - 0.8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// ----------------------------------------------------
// 初始化本地 Mock 数据库
// ----------------------------------------------------
export const initMockStorage = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(MOCK_PROFILES_KEY)) {
    localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
  }
  if (!localStorage.getItem(MOCK_POSTS_KEY)) {
    localStorage.setItem(MOCK_POSTS_KEY, JSON.stringify(DEFAULT_POSTS));
  }
  if (!localStorage.getItem(MOCK_COMMENTS_KEY)) {
    localStorage.setItem(MOCK_COMMENTS_KEY, JSON.stringify(DEFAULT_COMMENTS));
  }
  if (!localStorage.getItem(MOCK_FAVORITES_KEY)) {
    localStorage.setItem(MOCK_FAVORITES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(MOCK_LIKES_KEY)) {
    localStorage.setItem(MOCK_LIKES_KEY, JSON.stringify([]));
  }
};

// ----------------------------------------------------
// 辅助函数：读取和保存 LocalStorage
// ----------------------------------------------------
function getLocal<T>(key: string): T {
  initMockStorage();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : ([] as unknown as T);
}

function setLocal<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ----------------------------------------------------
// 核心 API 代理（Supabase + Mock 混合模式）
// ----------------------------------------------------
export const clientAPI = {
  // --- 用户认证 API ---
  auth: {
    async signUp(email: string, nickname: string) {
      if (isSupabaseConfigured && supabase) {
        try {
          // 在开发阶段，默认采用快捷注册，也可以通过 mock 兜底
          const { data, error } = await supabase.auth.signUp({
            email,
            password: 'mock_password_123456', // 统一使用免密形式或默认密码
            options: {
              data: { nickname }
            }
          });
          if (error) throw error;
          
          // 如果注册成功但需要确认邮件，则提示用户，并允许使用 mock 临时登录
          return { user: data.user, session: data.session, error: null };
        } catch (e: any) {
          console.warn('Supabase Auth SignUp failed, using Mock Auth instead:', e.message);
        }
      }

      // Mock 注册
      const profiles = getLocal<Profile[]>(MOCK_PROFILES_KEY);
      const newUserId = 'user-mock-' + Math.random().toString(36).substr(2, 9);
      const newProfile: Profile = {
        id: newUserId,
        email,
        nickname: nickname || email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newUserId}`,
        created_at: new Date().toISOString()
      };

      profiles.push(newProfile);
      setLocal(MOCK_PROFILES_KEY, profiles);
      setLocal(CURRENT_USER_KEY, newProfile);
      return { user: newProfile, session: { access_token: 'mock-token' }, error: null };
    },

    async signIn(email: string) {
      if (isSupabaseConfigured && supabase) {
        try {
          // 这里使用 password 形式登录以简化演示，默认密码为 mock_password_123456
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: 'mock_password_123456'
          });
          if (!error) {
            // 获取对应的 profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            return { user: profile || data.user, error: null };
          }
          throw error;
        } catch (e: any) {
          console.warn('Supabase Auth SignIn failed, attempting Mock Auth:', e.message);
        }
      }

      // Mock 登录：查找是否存在对应邮箱的 profile，没有则自动创建新账号
      const profiles = getLocal<Profile[]>(MOCK_PROFILES_KEY);
      let profile = profiles.find(p => p.email === email);
      if (!profile) {
        const newUserId = 'user-mock-' + Math.random().toString(36).substr(2, 9);
        profile = {
          id: newUserId,
          email,
          nickname: email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newUserId}`,
          created_at: new Date().toISOString()
        };
        profiles.push(profile);
        setLocal(MOCK_PROFILES_KEY, profiles);
      }
      setLocal(CURRENT_USER_KEY, profile);
      return { user: profile, error: null };
    },

    async signOut() {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      return { error: null };
    },

    async getCurrentUser(): Promise<Profile | null> {
      if (typeof window === 'undefined') return null;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            if (!error && profile) return profile as Profile;
            
            // 如果表不存在，则从 profile auth 返回
            return {
              id: user.id,
              email: user.email || '',
              nickname: user.user_metadata?.nickname || user.email?.split('@')[0] || '同学',
              avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`,
              created_at: user.created_at
            };
          }
        } catch (e) {
          console.warn('Get Supabase user failed, falling back to mock user session', e);
        }
      }

      const mockUser = localStorage.getItem(CURRENT_USER_KEY);
      return mockUser ? JSON.parse(mockUser) : null;
    },

    async updateProfile(nickname: string, avatarUrl: string): Promise<{ data: Profile | null; error: any }> {
      const user = await this.getCurrentUser();
      if (!user) return { data: null, error: '未登录' };

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({ nickname, avatar_url: avatarUrl })
            .eq('id', user.id)
            .select()
            .single();
          if (!error) return { data, error: null };
          throw error;
        } catch (e: any) {
          console.warn('Update Supabase profile failed, using Mock:', e.message);
        }
      }

      // Mock 更新
      const profiles = getLocal<Profile[]>(MOCK_PROFILES_KEY);
      const idx = profiles.findIndex(p => p.id === user.id);
      if (idx !== -1) {
        profiles[idx].nickname = nickname;
        profiles[idx].avatar_url = avatarUrl;
        setLocal(MOCK_PROFILES_KEY, profiles);
        setLocal(CURRENT_USER_KEY, profiles[idx]);
        return { data: profiles[idx], error: null };
      }
      return { data: null, error: '用户未找到' };
    }
  },

  // --- 帖子 API ---
  posts: {
    async list(category?: string, search?: string, sortBy: 'latest' | 'hottest' = 'latest'): Promise<Post[]> {
      if (isSupabaseConfigured && supabase) {
        try {
          let query = supabase
            .from('posts')
            .select('*, author:profiles(*)');

          if (category && category !== '全部' && category !== 'Other' && category !== '其他') {
            query = query.eq('category', category);
          }

          if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
          }

          if (sortBy === 'latest') {
            query = query.order('created_at', { ascending: false });
          } else {
            query = query.order('like_count', { ascending: false });
          }

          const { data, error } = await query;
          if (!error && data) return data as Post[];
          throw error;
        } catch (e: any) {
          console.warn('Supabase query posts failed, falling back to mock:', e.message);
        }
      }

      // Mock 查询
      let posts = getLocal<Post[]>(MOCK_POSTS_KEY);
      const profiles = getLocal<Profile[]>(MOCK_PROFILES_KEY);

      // 装载作者信息
      posts = posts.map(post => ({
        ...post,
        author: profiles.find(p => p.id === post.author_id) || DEFAULT_PROFILES[0]
      }));

      // 分类筛选
      if (category && category !== '全部' && category !== '其他' && category !== 'Other') {
        posts = posts.filter(p => p.category === category);
      }

      // 搜索筛选
      if (search) {
        const lowerSearch = search.toLowerCase();
        posts = posts.filter(p =>
          p.title.toLowerCase().includes(lowerSearch) ||
          p.content.toLowerCase().includes(lowerSearch)
        );
      }

      // 排序
      if (sortBy === 'latest') {
        posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else {
        posts.sort((a, b) => b.like_count - a.like_count);
      }

      return posts;
    },

    async getById(id: string): Promise<Post | null> {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*, author:profiles(*)')
            .eq('id', id)
            .single();
          if (!error && data) return data as Post;
          throw error;
        } catch (e: any) {
          console.warn(`Supabase getPostById ${id} failed, using Mock:`, e.message);
        }
      }

      const posts = getLocal<Post[]>(MOCK_POSTS_KEY);
      const profiles = getLocal<Profile[]>(MOCK_PROFILES_KEY);
      const post = posts.find(p => p.id === id);
      if (!post) return null;

      return {
        ...post,
        author: profiles.find(p => p.id === post.author_id) || DEFAULT_PROFILES[0]
      };
    },

    async create(title: string, content: string, category: string, imageUrl?: string): Promise<{ data: Post | null; error: any }> {
      const user = await clientAPI.auth.getCurrentUser();
      if (!user) return { data: null, error: '请先登录' };

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('posts')
            .insert({
              title,
              content,
              category,
              image_url: imageUrl,
              author_id: user.id,
              like_count: 0,
              comment_count: 0
            })
            .select()
            .single();
          if (!error) return { data, error: null };
          throw error;
        } catch (e: any) {
          console.warn('Supabase create post failed, trying Mock:', e.message);
        }
      }

      // Mock 创建
      const posts = getLocal<Post[]>(MOCK_POSTS_KEY);
      const newPost: Post = {
        id: 'post-mock-' + Math.random().toString(36).substr(2, 9),
        title,
        content,
        category,
        author_id: user.id,
        like_count: 0,
        comment_count: 0,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      };

      posts.unshift(newPost);
      setLocal(MOCK_POSTS_KEY, posts);
      return { data: newPost, error: null };
    },

    async delete(id: string): Promise<{ success: boolean; error: any }> {
      const user = await clientAPI.auth.getCurrentUser();
      if (!user) return { success: false, error: '请先登录' };

      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id)
            .eq('author_id', user.id);
          if (!error) return { success: true, error: null };
          throw error;
        } catch (e: any) {
          console.warn('Supabase delete post failed, using Mock:', e.message);
        }
      }

      // Mock 删除
      let posts = getLocal<Post[]>(MOCK_POSTS_KEY);
      const postIdx = posts.findIndex(p => p.id === id && p.author_id === user.id);
      if (postIdx !== -1) {
        posts.splice(postIdx, 1);
        setLocal(MOCK_POSTS_KEY, posts);
        return { success: true, error: null };
      }
      return { success: false, error: '帖子不存在或无权删除' };
    }
  },

  // --- 评论 API ---
  comments: {
    async listForPost(postId: string): Promise<Comment[]> {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('comments')
            .select('*, user:profiles(*)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
          
          if (!error && data) {
            const list = data as Comment[];
            // 组装评论嵌套回复
            const commentMap: Record<string, Comment> = {};
            const rootComments: Comment[] = [];
            
            list.forEach(c => {
              c.replies = [];
              commentMap[c.id] = c;
            });
            
            list.forEach(c => {
              if (c.parent_id && commentMap[c.parent_id]) {
                commentMap[c.parent_id].replies?.push(c);
              } else {
                rootComments.push(c);
              }
            });
            return rootComments;
          }
          throw error;
        } catch (e: any) {
          console.warn('Supabase query comments failed, trying Mock:', e.message);
        }
      }

      // Mock
      const allComments = getLocal<Comment[]>(MOCK_COMMENTS_KEY);
      const profiles = getLocal<Profile[]>(MOCK_PROFILES_KEY);
      const filtered = allComments.filter(c => c.post_id === postId);

      const list: Comment[] = filtered.map(c => ({
        ...c,
        user: profiles.find(p => p.id === c.user_id) || DEFAULT_PROFILES[0]
      }));

      // 构建评论树
      const commentMap: Record<string, Comment> = {};
      const rootComments: Comment[] = [];

      list.forEach(c => {
        c.replies = [];
        commentMap[c.id] = c;
      });

      list.forEach(c => {
        if (c.parent_id && commentMap[c.parent_id]) {
          commentMap[c.parent_id].replies?.push(c);
        } else {
          rootComments.push(c);
        }
      });

      return rootComments;
    },

    async create(postId: string, content: string, parentId?: string): Promise<{ data: Comment | null; error: any }> {
      const user = await clientAPI.auth.getCurrentUser();
      if (!user) return { data: null, error: '请先登录' };

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('comments')
            .insert({
              post_id: postId,
              user_id: user.id,
              content,
              parent_id: parentId
            })
            .select()
            .single();
          if (!error) return { data, error: null };
          throw error;
        } catch (e: any) {
          console.warn('Supabase create comment failed, using Mock:', e.message);
        }
      }

      // Mock
      const comments = getLocal<Comment[]>(MOCK_COMMENTS_KEY);
      const newComment: Comment = {
        id: 'comment-mock-' + Math.random().toString(36).substr(2, 9),
        post_id: postId,
        user_id: user.id,
        content,
        parent_id: parentId,
        created_at: new Date().toISOString()
      };
      comments.push(newComment);
      setLocal(MOCK_COMMENTS_KEY, comments);

      // 更新帖子评论计数
      const posts = getLocal<Post[]>(MOCK_POSTS_KEY);
      const postIdx = posts.findIndex(p => p.id === postId);
      if (postIdx !== -1) {
        posts[postIdx].comment_count += 1;
        setLocal(MOCK_POSTS_KEY, posts);
      }

      return { data: newComment, error: null };
    },

    async delete(id: string): Promise<{ success: boolean; error: any }> {
      const user = await clientAPI.auth.getCurrentUser();
      if (!user) return { success: false, error: '请先登录' };

      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
          if (!error) return { success: true, error: null };
          throw error;
        } catch (e: any) {
          console.warn('Supabase delete comment failed, using Mock:', e.message);
        }
      }

      // Mock
      let comments = getLocal<Comment[]>(MOCK_COMMENTS_KEY);
      const targetIdx = comments.findIndex(c => c.id === id && c.user_id === user.id);
      if (targetIdx !== -1) {
        const comment = comments[targetIdx];
        comments.splice(targetIdx, 1);
        setLocal(MOCK_COMMENTS_KEY, comments);

        // 更新帖子评论数
        const posts = getLocal<Post[]>(MOCK_POSTS_KEY);
        const postIdx = posts.findIndex(p => p.id === comment.post_id);
        if (postIdx !== -1) {
          posts[postIdx].comment_count = Math.max(0, posts[postIdx].comment_count - 1);
          setLocal(MOCK_POSTS_KEY, posts);
        }
        return { success: true, error: null };
      }
      return { success: false, error: '评论不存在或无权删除' };
    }
  },

  // --- 点赞 API ---
  likes: {
    async toggle(postId: string): Promise<{ liked: boolean; count: number; error: any }> {
      const user = await clientAPI.auth.getCurrentUser();
      if (!user) return { liked: false, count: 0, error: '请先登录' };

      if (isSupabaseConfigured && supabase) {
        try {
          // 检查是否点赞
          const { data: existingLike } = await supabase
            .from('post_likes')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (existingLike) {
            // 取消点赞
            await supabase.from('post_likes').delete().eq('id', existingLike.id);
            const { data: post } = await supabase.from('posts').select('like_count').eq('id', postId).single();
            return { liked: false, count: post?.like_count || 0, error: null };
          } else {
            // 新增点赞
            await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
            const { data: post } = await supabase.from('posts').select('like_count').eq('id', postId).single();
            return { liked: true, count: post?.like_count || 0, error: null };
          }
        } catch (e: any) {
          console.warn('Supabase toggle like failed, using Mock:', e.message);
        }
      }

      // Mock
      interface LikeRecord { user_id: string; post_id: string }
      const likes = getLocal<LikeRecord[]>(MOCK_LIKES_KEY);
      const posts = getLocal<Post[]>(MOCK_POSTS_KEY);
      const postIdx = posts.findIndex(p => p.id === postId);
      if (postIdx === -1) return { liked: false, count: 0, error: '帖子不存在' };

      const existingLikeIdx = likes.findIndex(l => l.post_id === postId && l.user_id === user.id);
      let liked = false;

      if (existingLikeIdx !== -1) {
        likes.splice(existingLikeIdx, 1);
        posts[postIdx].like_count = Math.max(0, posts[postIdx].like_count - 1);
        liked = false;
      } else {
        likes.push({ user_id: user.id, post_id: postId });
        posts[postIdx].like_count += 1;
        liked = true;
      }

      setLocal(MOCK_LIKES_KEY, likes);
      setLocal(MOCK_POSTS_KEY, posts);
      return { liked, count: posts[postIdx].like_count, error: null };
    },

    async getStatus(postId: string): Promise<boolean> {
      const user = await clientAPI.auth.getCurrentUser();
      if (!user) return false;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();
          return !!data;
        } catch (e) {
          return false;
        }
      }

      // Mock
      interface LikeRecord { user_id: string; post_id: string }
      const likes = getLocal<LikeRecord[]>(MOCK_LIKES_KEY);
      return likes.some(l => l.post_id === postId && l.user_id === user.id);
    }
  },

  // --- 收藏 API ---
  favorites: {
    async toggle(postId: string): Promise<{ favorited: boolean; error: any }> {
      const user = await clientAPI.auth.getCurrentUser();
      if (!user) return { favorited: false, error: '请先登录' };

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: existingFav } = await supabase
            .from('favorites')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (existingFav) {
            await supabase.from('favorites').delete().eq('id', existingFav.id);
            return { favorited: false, error: null };
          } else {
            await supabase.from('favorites').insert({ post_id: postId, user_id: user.id });
            return { favorited: true, error: null };
          }
        } catch (e: any) {
          console.warn('Supabase toggle favorite failed, using Mock:', e.message);
        }
      }

      // Mock
      interface FavoriteRecord { user_id: string; post_id: string }
      const favs = getLocal<FavoriteRecord[]>(MOCK_FAVORITES_KEY);
      const existingIdx = favs.findIndex(f => f.post_id === postId && f.user_id === user.id);
      let favorited = false;

      if (existingIdx !== -1) {
        favs.splice(existingIdx, 1);
        favorited = false;
      } else {
        favs.push({ user_id: user.id, post_id: postId });
        favorited = true;
      }

      setLocal(MOCK_FAVORITES_KEY, favs);
      return { favorited, error: null };
    },

    async getStatus(postId: string): Promise<boolean> {
      const user = await clientAPI.auth.getCurrentUser();
      if (!user) return false;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase
            .from('favorites')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();
          return !!data;
        } catch (e) {
          return false;
        }
      }

      // Mock
      interface FavoriteRecord { user_id: string; post_id: string }
      const favs = getLocal<FavoriteRecord[]>(MOCK_FAVORITES_KEY);
      return favs.some(f => f.post_id === postId && f.user_id === user.id);
    },

    async listUserFavorites(): Promise<Post[]> {
      const user = await clientAPI.auth.getCurrentUser();
      if (!user) return [];

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('post_id, posts(*, author:profiles(*))')
            .eq('user_id', user.id);

          if (!error && data) {
            // @ts-ignore
            return data.map(item => item.posts).filter(Boolean) as Post[];
          }
          throw error;
        } catch (e: any) {
          console.warn('Supabase query favorites failed, using Mock:', e.message);
        }
      }

      // Mock
      interface FavoriteRecord { user_id: string; post_id: string }
      const favs = getLocal<FavoriteRecord[]>(MOCK_FAVORITES_KEY).filter(f => f.user_id === user.id);
      const posts = getLocal<Post[]>(MOCK_POSTS_KEY);
      const profiles = getLocal<Profile[]>(MOCK_PROFILES_KEY);

      const userFavPosts = posts.filter(p => favs.some(f => f.post_id === p.id));
      return userFavPosts.map(p => ({
        ...p,
        author: profiles.find(pr => pr.id === p.author_id) || DEFAULT_PROFILES[0]
      }));
    }
  }
};
