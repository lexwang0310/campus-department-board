-- 院系留言板 (Campus Department Board) 数据库 Schema 初始化脚本
-- 您可以直接在 Supabase SQL Editor 中运行此脚本。

-- 1. 创建 profiles (用户详情表)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    nickname TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 启用行级安全（Row Level Security）
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. 创建 posts (帖子表)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    like_count INT DEFAULT 0 NOT NULL,
    comment_count INT DEFAULT 0 NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. 创建 comments (评论表)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. 创建 favorites (收藏表)
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 5. 创建 post_likes (帖子点赞记录表)
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- 6. 创建触发器：自动同步 auth.users 到 public.profiles
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nickname, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/adventurer/svg?seed=' || new.id)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nickname = COALESCE(profiles.nickname, EXCLUDED.nickname),
        avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------
-- 7. 创建触发器：自动更新 posts.like_count
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_post_like()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts
        SET like_count = like_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts
        SET like_count = greatest(0, like_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_like_added_or_removed
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_like();

-- ----------------------------------------------------
-- 8. 创建触发器：自动更新 posts.comment_count
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_post_comment()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts
        SET comment_count = greatest(0, comment_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_comment_added_or_removed
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment();

-- ----------------------------------------------------
-- 9. 配置行级安全策略（RLS Policies）
-- ----------------------------------------------------

-- Profiles 策略
CREATE POLICY "公开查看用户详情" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "用户只能修改自己的详情" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Posts 策略
CREATE POLICY "所有人均可公开浏览帖子" ON public.posts FOR SELECT USING (true);
CREATE POLICY "只有登录用户可发表帖子" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "只有作者可修改/删除自己的帖子" ON public.posts FOR ALL USING (auth.uid() = author_id);

-- Comments 策略
CREATE POLICY "所有人均可查看评论" ON public.comments FOR SELECT USING (true);
CREATE POLICY "只有登录用户可发表评论" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "只有作者可删除自己的评论" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Favorites 策略
CREATE POLICY "用户只能查看自己的收藏" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户可以添加自己的收藏" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可以取消自己的收藏" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Post Likes 策略
CREATE POLICY "所有人均可查看帖子点赞数" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "用户可以给帖子点赞" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可以取消点赞" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);
