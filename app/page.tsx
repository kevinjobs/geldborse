'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Zap, BarChart3, Shield, TrendingUp, Download, Gauge } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Home() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  const getStartLink = () => {
    return mounted && user ? '/overview' : '/auth/login';
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="border-b border-[#2C2C2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="size-8" />
            <span className="text-white font-semibold text-lg">Geldborse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-[#98989D] hover:text-white transition-colors text-sm"
            >
              登录
            </Link>
            <Link
              href="/auth/register"
              className="bg-[#00E5FF] text-[#121212] px-4 py-2 rounded-[8px] text-sm font-medium hover:bg-[#00E5FF]/90 transition-colors"
            >
              免费注册
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#32D74B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#1E1E1E] border border-[#2C2C2E] rounded-full px-4 py-1.5 mb-8">
              <Zap className="h-3.5 w-3.5 text-[#00E5FF]" />
              <span className="text-[#98989D] text-xs">智能财务管理平台</span>
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl tracking-tight">
              掌控你的
              <span className="text-[#00E5FF]">财务</span>
              数据
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-[#98989D]">
              Geldborse 帮助你轻松追踪收支、管理资产、制定预算，
              <br className="hidden sm:block" />
              让财务管理变得简单而高效。
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                href={getStartLink()}
                className="inline-flex items-center px-6 py-3 rounded-[8px] bg-[#00E5FF] text-[#121212] font-medium hover:bg-[#00E5FF]/90 transition-colors"
              >
                {mounted && user ? '进入控制台' : '开始使用'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-6 py-3 rounded-[8px] border border-[#2C2C2E] text-[#98989D] font-medium hover:border-[#00E5FF]/50 hover:text-white transition-colors"
              >
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-[#2C2C2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold text-white">强大功能，简单操作</h2>
            <p className="mt-3 text-[#98989D]">全方位的财务管理工具，帮助你实现财务目标</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-[16px] bg-[#1E1E1E] border border-[#2C2C2E] hover:border-[#00E5FF]/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#00E5FF]/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5 text-[#00E5FF]" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">收支追踪</h3>
              <p className="text-sm text-[#98989D]">轻松记录每一笔收支，自动分类，生成详细报表，一目了然。</p>
            </div>

            <div className="p-6 rounded-[16px] bg-[#1E1E1E] border border-[#2C2C2E] hover:border-[#32D74B]/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#32D74B]/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 text-[#32D74B]" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">资产分析</h3>
              <p className="text-sm text-[#98989D]">全面分析资产分布，提供多维度财务报表和图表。</p>
            </div>

            <div className="p-6 rounded-[16px] bg-[#1E1E1E] border border-[#2C2C2E] hover:border-[#FFD60A]/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#FFD60A]/10 flex items-center justify-center mb-4">
                <Gauge className="h-5 w-5 text-[#FFD60A]" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">账户管理</h3>
              <p className="text-sm text-[#98989D]">集中管理多个账户，统一查看所有财务信息。</p>
            </div>

            <div className="p-6 rounded-[16px] bg-[#1E1E1E] border border-[#2C2C2E] hover:border-[#FF9F0A]/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#FF9F0A]/10 flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-[#FF9F0A]" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">快照功能</h3>
              <p className="text-sm text-[#98989D]">定期生成资产快照，记录历史数据，分析变化趋势。</p>
            </div>

            <div className="p-6 rounded-[16px] bg-[#1E1E1E] border border-[#2C2C2E] hover:border-[#32D74B]/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#32D74B]/10 flex items-center justify-center mb-4">
                <Download className="h-5 w-5 text-[#32D74B]" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">数据导出</h3>
              <p className="text-sm text-[#98989D]">支持多种格式导出，方便保存和分享财务数据。</p>
            </div>

            <div className="p-6 rounded-[16px] bg-[#1E1E1E] border border-[#2C2C2E] hover:border-[#00E5FF]/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#00E5FF]/10 flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 text-[#00E5FF]" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">数据安全</h3>
              <p className="text-sm text-[#98989D]">采用加密技术，保护你的财务数据安全。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#2C2C2E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-white">开始你的财务管理之旅</h2>
          <p className="mt-4 text-[#98989D]">立即注册，体验智能财务管理工具</p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-6 py-3 rounded-[8px] bg-[#00E5FF] text-[#121212] font-medium hover:bg-[#00E5FF]/90 transition-colors"
            >
              免费注册
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 rounded-[8px] border border-[#2C2C2E] text-[#98989D] font-medium hover:border-[#00E5FF]/50 hover:text-white transition-colors"
            >
              已有账号？登录
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2C2C2E] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Logo className="size-6" />
                <span className="text-white font-semibold">Geldborse</span>
              </div>
              <p className="text-sm text-[#98989D]">智能财务管理工具，让你的财务更健康</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">功能</h3>
              <ul className="space-y-2">
                <li><Link href="/record" className="text-sm text-[#98989D] hover:text-white transition-colors">收支追踪</Link></li>
                <li><Link href="/overview" className="text-sm text-[#98989D] hover:text-white transition-colors">资产分析</Link></li>
                <li><Link href="/accounts" className="text-sm text-[#98989D] hover:text-white transition-colors">账户管理</Link></li>
                <li><Link href="/snapshots" className="text-sm text-[#98989D] hover:text-white transition-colors">快照功能</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">资源</h3>
              <ul className="space-y-2">
                <li><Link href="/overview" className="text-sm text-[#98989D] hover:text-white transition-colors">概览页面</Link></li>
                <li><Link href="/accounts" className="text-sm text-[#98989D] hover:text-white transition-colors">账户管理</Link></li>
                <li><Link href="/record" className="text-sm text-[#98989D] hover:text-white transition-colors">收支记录</Link></li>
                <li><Link href="/export" className="text-sm text-[#98989D] hover:text-white transition-colors">数据导出</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">法律</h3>
              <ul className="space-y-2">
                <li><span className="text-sm text-[#98989D]">隐私政策</span></li>
                <li><span className="text-sm text-[#98989D]">服务条款</span></li>
                <li><span className="text-sm text-[#98989D]">Cookie 政策</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-[#2C2C2E] pt-8 flex flex-col items-center justify-between sm:flex-row">
            <p className="text-[#98989D] text-sm">© 2024 Geldborse. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
