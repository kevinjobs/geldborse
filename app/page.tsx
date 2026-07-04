'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChartLineUpIcon,
  WalletIcon,
  CameraIcon,
  ListIcon,
  ShieldCheckIcon,
  DeviceMobileCameraIcon,
  MoonStarsIcon,
  KeyIcon,
  ArrowsClockwiseIcon,
  ArrowRightIcon,
  SparkleIcon,
  TrendUpIcon,
  EyeIcon,
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/logo';

/* ------------------------------------------------------------------ */
/*  Scroll reveal wrapper — staggers children into view on enter.      */
/* ------------------------------------------------------------------ */
function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Respect reduced motion: show immediately (deferred to avoid a sync setState in effect).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${className} transition-all duration-700 ease-out will-change-transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Screenshot card — bordered, glowing, lifts on hover.               */
/* ------------------------------------------------------------------ */
function Screenshot({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`group relative aspect-[16/9] w-full overflow-hidden rounded-[16px] border border-[#2C2C2E] bg-card shadow-[0_12px_32px_-4px_rgb(0_0_0/0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_48px_-8px_rgb(0_229_255/0.15)] ${className}`}
    >
      {/* subtle inner highlight on top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-top"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section label — small cyan eyebrow above titles.                   */
/* ------------------------------------------------------------------ */
function Eyebrow({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-primary">
      <Icon className="size-4" weight="duotone" />
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function Home() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const startLink = mounted && user ? '/overview' : '/auth/login';
  const startLabel = mounted && user ? '进入控制台' : '开始使用';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ============ Header ============ */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="size-8" />
            <span className="font-heading text-lg font-semibold tracking-tight">Geldborse</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/auth/login"
              className="rounded-[8px] px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              登录
            </Link>
            <Link
              href="/auth/register"
              className="rounded-[8px] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              免费注册
            </Link>
          </div>
        </div>
      </header>

      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden">
        {/* atmospheric glows */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-success/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 md:pb-24 md:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 backdrop-blur-sm">
                <SparkleIcon className="size-3.5 text-primary" weight="fill" />
                <span className="text-xs text-muted-foreground">智能财务管理平台</span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                掌控你的<span className="text-primary">财务</span>数据
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Geldborse 帮助你轻松追踪收支、管理资产、制定预算，让财务管理变得简单而高效。
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href={startLink}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_-4px_rgb(0_229_255/0.5)] sm:w-auto"
                >
                  {startLabel}
                  <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex w-full items-center justify-center rounded-[10px] border border-border px-6 py-3 font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground sm:w-auto"
                >
                  免费注册
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Hero screenshot — floating, tilted, cyan glow */}
          <Reveal delay={360} className="mt-16 md:mt-20">
            <div className="relative mx-auto max-w-5xl">
              {/* glow behind the image */}
              <div className="pointer-events-none absolute -inset-x-8 -inset-y-6 bg-primary/15 blur-[80px]" />
              <div className="animate-scale-in relative overflow-hidden rounded-[20px] border border-[#2C2C2E] bg-card shadow-[0_24px_64px_-12px_rgb(0_0_0/0.6)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src="/screenshots/overview.png"
                    alt="Geldborse 总览仪表板界面"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ Feature Showcase — alternating sections ============ */}
      <section className="relative border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          {/* Section A: 总览仪表板 — image left, text right */}
          <Reveal>
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
              <Screenshot
                src="/screenshots/overview.png"
                alt="总览仪表板展示净资产与资产趋势"
              />
              <div>
                <Eyebrow icon={ChartLineUpIcon}>总览仪表板</Eyebrow>
                <h3 className="mt-4 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  一目了然的总览
                </h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  KPI 卡片实时展示净资产、收支汇总，面积图追踪资产变化趋势。所有数字一目了然。
                </p>
              </div>
            </div>
          </Reveal>

          {/* Section B: 收支记录 — text left, image right */}
          <Reveal className="mt-24 md:mt-32">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="order-2 md:order-1">
                <Eyebrow icon={ListIcon}>收支记录</Eyebrow>
                <h3 className="mt-4 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  轻松记录每笔收支
                </h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  支持多账户收支记录，自动分类，绿色收入、红色支出，清晰直观。每笔记录都有迹可循。
                </p>
              </div>
              <div className="order-1 md:order-2">
                <Screenshot
                  src="/screenshots/records.png"
                  alt="收支记录列表，绿色收入与红色支出"
                />
              </div>
            </div>
          </Reveal>

          {/* Section C: 账户管理 — image left, text right */}
          <Reveal className="mt-24 md:mt-32">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
              <Screenshot
                src="/screenshots/accounts.png"
                alt="账户管理页面，展示支付宝、微信、银行卡等账户"
              />
              <div>
                <Eyebrow icon={WalletIcon}>账户管理</Eyebrow>
                <h3 className="mt-4 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  集中管理所有账户
                </h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  支付宝、微信、银行卡、信用卡、证券账户——统一管理，品牌图标识别，余额尽在掌握。
                </p>
              </div>
            </div>
          </Reveal>

          {/* Section D: 每日快照 — text left, image right */}
          <Reveal className="mt-24 md:mt-32">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="order-2 md:order-1">
                <Eyebrow icon={CameraIcon}>每日快照</Eyebrow>
                <h3 className="mt-4 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  追踪资产变化趋势
                </h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  定期生成资产快照，多色折线图展示净资产、正资产、负资产走势。让时间见证财富增长。
                </p>
              </div>
              <div className="order-1 md:order-2">
                <Screenshot
                  src="/screenshots/snapshots.png"
                  alt="资产快照折线图，展示净资产与正负资产走势"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ Feature Highlights Strip ============ */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { icon: ShieldCheckIcon, label: '数据加密' },
                { icon: DeviceMobileCameraIcon, label: '响应式设计' },
                { icon: TrendUpIcon, label: '数据可视化' },
                { icon: ArrowsClockwiseIcon, label: '导入导出' },
                { icon: MoonStarsIcon, label: '深色模式' },
                { icon: KeyIcon, label: 'API 开放' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center justify-center gap-2.5 rounded-[12px] border border-border bg-background/40 px-4 py-3 transition-colors hover:border-primary/30"
                >
                  <Icon className="size-5 shrink-0 text-primary" weight="duotone" />
                  <span className="text-sm text-foreground/90">{label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ Mobile Showcase ============ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <Reveal>
            <div className="flex flex-col items-center gap-12 md:flex-row md:justify-center md:gap-20">
              {/* Phone frame mockup (CSS only) */}
              <div className="relative shrink-0">
                <div className="relative h-[560px] w-[280px] rounded-[44px] border border-[#3a3a3c] bg-[#0a0a0a] p-3 shadow-[0_24px_64px_-12px_rgb(0_0_0/0.7)]">
                  {/* notch */}
                  <div className="absolute left-1/2 top-3 z-10 h-6 w-28 -translate-x-1/2 rounded-b-[16px] bg-[#0a0a0a]" />
                  {/* screen */}
                  <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-[#2C2C2E] bg-background">
                    <Image
                      src="/screenshots/mobile.png"
                      alt="Geldborse 移动端总览界面"
                      fill
                      sizes="280px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                {/* cyan glow under phone */}
                <div className="pointer-events-none absolute -inset-x-8 bottom-0 h-24 bg-primary/10 blur-[60px]" />
              </div>

              {/* Text */}
              <div className="max-w-md text-center md:text-left">
                <Eyebrow icon={DeviceMobileCameraIcon}>移动端</Eyebrow>
                <h3 className="mt-4 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  随时随地，掌上管理
                </h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  响应式设计让 Geldborse 在手机、平板、桌面端都保持一致体验。通勤路上记一笔，睡前看一眼资产，财务管理无缝融入生活。
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground md:justify-start">
                  <EyeIcon className="size-4 text-primary" weight="duotone" />
                  <span>自适应所有屏幕尺寸</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative border-t border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
              开始你的财务管理之旅
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              立即注册，体验智能财务管理工具。几分钟内上手，从此告别记账焦虑。
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/auth/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_-4px_rgb(0_229_255/0.5)] sm:w-auto"
              >
                免费注册
                <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-[10px] border border-border px-6 py-3 font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground sm:w-auto"
              >
                已有账号？登录
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="border-t border-border bg-card/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <Logo className="size-6" />
                <span className="font-heading font-semibold">Geldborse</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                智能财务管理工具，让你的财务更健康
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">功能</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/record" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    收支追踪
                  </Link>
                </li>
                <li>
                  <Link href="/overview" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    资产分析
                  </Link>
                </li>
                <li>
                  <Link href="/accounts" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    账户管理
                  </Link>
                </li>
                <li>
                  <Link href="/snapshots" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    快照功能
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">资源</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/overview" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    概览页面
                  </Link>
                </li>
                <li>
                  <Link href="/accounts" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    账户管理
                  </Link>
                </li>
                <li>
                  <Link href="/record" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    收支记录
                  </Link>
                </li>
                <li>
                  <Link href="/export" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    数据导出
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">法律</h3>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-foreground">隐私政策</span></li>
                <li><span className="text-sm text-muted-foreground">服务条款</span></li>
                <li><span className="text-sm text-muted-foreground">Cookie 政策</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">© 2024 Geldborse. 保留所有权利。</p>
            <p className="text-xs text-muted-foreground/70">为追求财务自由的人而设计</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
