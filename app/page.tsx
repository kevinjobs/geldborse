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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="size-8" />
            <span className="text-foreground font-semibold text-lg">Geldborse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              登录
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-[8px] text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              免费注册
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-8">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground text-xs">智能财务管理平台</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl tracking-tight">
              掌控你的
              <span className="text-primary">财务</span>
              数据
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
              Geldborse 帮助你轻松追踪收支、管理资产、制定预算，
              <br className="hidden sm:block" />
              让财务管理变得简单而高效。
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                href={getStartLink()}
                className="inline-flex items-center px-6 py-3 rounded-[8px] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                {mounted && user ? '进入控制台' : '开始使用'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-6 py-3 rounded-[8px] border border-border text-muted-foreground font-medium hover:border-primary/50 hover:text-foreground transition-colors"
              >
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold text-foreground">强大功能，简单操作</h2>
            <p className="mt-3 text-muted-foreground">全方位的财务管理工具，帮助你实现财务目标</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-[16px] bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">收支追踪</h3>
              <p className="text-sm text-muted-foreground">轻松记录每一笔收支，自动分类，生成详细报表，一目了然。</p>
            </div>

            <div className="p-6 rounded-[16px] bg-card border border-border hover:border-success/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-success/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">资产分析</h3>
              <p className="text-sm text-muted-foreground">全面分析资产分布，提供多维度财务报表和图表。</p>
            </div>

            <div className="p-6 rounded-[16px] bg-card border border-border hover:border-warning/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-warning/10 flex items-center justify-center mb-4">
                <Gauge className="h-5 w-5 text-warning" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">账户管理</h3>
              <p className="text-sm text-muted-foreground">集中管理多个账户，统一查看所有财务信息。</p>
            </div>

            <div className="p-6 rounded-[16px] bg-card border border-border hover:border-[var(--chart-4)]/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[var(--chart-4)]/10 flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-[var(--chart-4)]" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">快照功能</h3>
              <p className="text-sm text-muted-foreground">定期生成资产快照，记录历史数据，分析变化趋势。</p>
            </div>

            <div className="p-6 rounded-[16px] bg-card border border-border hover:border-success/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-success/10 flex items-center justify-center mb-4">
                <Download className="h-5 w-5 text-success" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">数据导出</h3>
              <p className="text-sm text-muted-foreground">支持多种格式导出，方便保存和分享财务数据。</p>
            </div>

            <div className="p-6 rounded-[16px] bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">数据安全</h3>
              <p className="text-sm text-muted-foreground">采用加密技术，保护你的财务数据安全。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground">开始你的财务管理之旅</h2>
          <p className="mt-4 text-muted-foreground">立即注册，体验智能财务管理工具</p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-6 py-3 rounded-[8px] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              免费注册
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 rounded-[8px] border border-border text-muted-foreground font-medium hover:border-primary/50 hover:text-foreground transition-colors"
            >
              已有账号？登录
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Logo className="size-6" />
                <span className="text-foreground font-semibold">Geldborse</span>
              </div>
              <p className="text-sm text-muted-foreground">智能财务管理工具，让你的财务更健康</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">功能</h3>
              <ul className="space-y-2">
                <li><Link href="/record" className="text-sm text-muted-foreground hover:text-foreground transition-colors">收支追踪</Link></li>
                <li><Link href="/overview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">资产分析</Link></li>
                <li><Link href="/accounts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">账户管理</Link></li>
                <li><Link href="/snapshots" className="text-sm text-muted-foreground hover:text-foreground transition-colors">快照功能</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">资源</h3>
              <ul className="space-y-2">
                <li><Link href="/overview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">概览页面</Link></li>
                <li><Link href="/accounts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">账户管理</Link></li>
                <li><Link href="/record" className="text-sm text-muted-foreground hover:text-foreground transition-colors">收支记录</Link></li>
                <li><Link href="/export" className="text-sm text-muted-foreground hover:text-foreground transition-colors">数据导出</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">法律</h3>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-foreground">隐私政策</span></li>
                <li><span className="text-sm text-muted-foreground">服务条款</span></li>
                <li><span className="text-sm text-muted-foreground">Cookie 政策</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 flex flex-col items-center justify-between sm:flex-row">
            <p className="text-muted-foreground text-sm">© 2024 Geldborse. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
