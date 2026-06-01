import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/navbar';

export const metadata: Metadata = {
  title: '院系留言板 - Campus Department Board',
  description: '面向大学生的院系交流与信息共享平台，帮助学生在院系内部进行提问、交流、经验分享和资源互助。',
  keywords: '院系留言板, 校园交流, 选课避坑, 考试经验, 实习就业, 资源分享, 学术交流',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col relative">
        <AuthProvider>
          {/* 流光霓虹背景环境光 */}
          <div className="absolute top-[10%] left-[5%] aurora-bg bg-indigo-500/10 pointer-events-none" />
          <div className="absolute top-[40%] right-[5%] aurora-bg bg-purple-500/10 pointer-events-none" />
          <div className="absolute bottom-[10%] left-[20%] aurora-bg bg-blue-500/10 pointer-events-none" />

          {/* 导航栏 */}
          <Navbar />

          {/* 主体页面内容区域 */}
          <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            {children}
          </main>

          {/* 极简精致页脚 */}
          <footer className="border-t border-slate-900 bg-slate-950/20 backdrop-blur-md py-6 text-center text-xs text-slate-500 relative z-10">
            <div className="max-w-7xl mx-auto px-4">
              <p>© {new Date().getFullYear()} 院系留言板 (Campus Department Board). Built with Next.js 15 & Supabase.</p>
              <p className="mt-1 text-slate-600">旨在降低校园内部信息流转成本，提升互助共创氛围。</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
