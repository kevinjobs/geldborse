'use client';

import { useState, useEffect } from "react";
import { ArrowRight, BarChart3, DollarSign, Wallet, Activity, PieChart, FileText, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const balanceData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: '账户余额',
      data: [5000, 5500, 5200, 5800, 6200, 6500],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
};

const expenseData = {
  labels: ['餐饮', '交通', '购物', '娱乐', '其他'],
  datasets: [
    {
      data: [30, 20, 25, 15, 10],
      backgroundColor: [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
      ],
    },
  ],
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 根据登录状态决定跳转链接
  const getStartedLink = isAuthenticated ? "/overview" : "/auth/register";
  
  // 避免hydration mismatch，服务端渲染时显示默认内容
  const showAuthenticatedContent = mounted && isAuthenticated;
  
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Geldborse</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-zinc-900 dark:text-zinc-100 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">首页</Link>
            <Link href="/overview" className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">总览</Link>
            <Link href="/accounts" className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">账户</Link>
            <Link href="/record" className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">记录</Link>
            <Link href="/export" className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">导出</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <Link href={getStartedLink}>{showAuthenticatedContent ? "进入后台" : "开始使用"}</Link>
            </Button>
            {showAuthenticatedContent && (
              <Button variant="ghost" size="icon" className="rounded-full">
                <Shield className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* 英雄区域 */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 space-y-6">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">个人财务管理</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
                  掌控你的财务，
                  <br />
                  <span className="text-blue-600 dark:text-blue-400">实现财务自由</span>
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-xl">
                  Geldborse 帮助你轻松管理账户、追踪支出、分析财务状况，让你对自己的财务了如指掌。
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6" asChild>
                    <Link href={getStartedLink}>
                      {showAuthenticatedContent ? "进入后台" : "立即开始"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="secondary" className="text-lg px-8 py-6" asChild>
                    <Link href="#features">了解更多</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {i}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">10,000+</span> 人正在使用
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-zinc-200 dark:border-zinc-700">
                  <Card>
                    <CardHeader>
                      <CardTitle>账户余额</CardTitle>
                      <CardDescription>过去6个月的余额变化</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <Line data={balanceData} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 功能介绍区域 */}
        <section id="features" className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">核心功能</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                强大的财务管理工具
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                我们提供全面的财务管理功能，帮助你轻松管理个人财务，实现财务目标
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Wallet className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
                  title: "账户管理",
                  description: "创建和管理多个财务账户，包括现金、银行账户等，实时追踪余额变化"
                },
                {
                  icon: <Activity className="h-10 w-10 text-green-600 dark:text-green-400" />,
                  title: "交易记录",
                  description: "轻松记录收入和支出，分类管理交易，了解资金流向"
                },
                {
                  icon: <PieChart className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />,
                  title: "财务分析",
                  description: "通过图表和报表分析财务状况，识别消费模式，优化支出"
                },
                {
                  icon: <BarChart3 className="h-10 w-10 text-purple-600 dark:text-purple-400" />,
                  title: "预算管理",
                  description: "设置月度预算，跟踪预算执行情况，避免超支"
                },
                {
                  icon: <FileText className="h-10 w-10 text-red-600 dark:text-red-400" />,
                  title: "数据导出",
                  description: "导出财务数据为PDF和Excel格式，方便进行离线分析"
                },
                {
                  icon: <Shield className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
                  title: "数据安全",
                  description: "本地存储数据，保护你的财务信息安全"
                }
              ].map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-3 w-fit mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 数据概览区域 */}
        <section className="py-20 bg-zinc-50 dark:bg-gray-850">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">财务概览</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                一目了然的财务状况
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                通过直观的图表和数据，快速了解你的财务健康状况
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>支出分类</CardTitle>
                  <CardDescription>本月支出分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Pie data={expenseData} />
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">总资产</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-3xl font-bold text-zinc-900 dark:text-white">12,500</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                      较上月 <span className="text-green-600 dark:text-green-400 font-medium">+5.2%</span>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">本月支出</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <span className="text-3xl font-bold text-zinc-900 dark:text-white">2,150</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                      较上月 <span className="text-red-600 dark:text-red-400 font-medium">+2.8%</span>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">本月收入</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-3xl font-bold text-zinc-900 dark:text-white">3,500</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                      较上月 <span className="text-green-600 dark:text-green-400 font-medium">+3.5%</span>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">预算执行</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-zinc-900 dark:text-white">62%</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                      本月预算使用情况
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 行动号召区域 */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              开始你的财务管理之旅
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              立即注册，免费使用所有功能，掌控你的财务未来
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!showAuthenticatedContent ? (
                <Button className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6" asChild>
                  <Link href="/auth/register">免费注册</Link>
                </Button>
              ) : (
                <Button className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6" asChild>
                  <Link href="/overview">进入后台</Link>
                </Button>
              )}
              <Button variant="secondary" className="bg-blue-700 hover:bg-blue-800 text-white text-lg px-8 py-6" asChild>
                <Link href="#features">了解更多</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-zinc-900 text-zinc-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Geldborse</h3>
              </div>
              <p className="mb-4">
                简单、强大的个人财务管理工具，帮助你实现财务自由
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">功能</h4>
              <ul className="space-y-2">
                <li><Link href="/overview" className="hover:text-blue-400 transition-colors">总览</Link></li>
                <li><Link href="/accounts" className="hover:text-blue-400 transition-colors">账户管理</Link></li>
                <li><Link href="/record" className="hover:text-blue-400 transition-colors">收支记录</Link></li>
                <li><Link href="/snapshots" className="hover:text-blue-400 transition-colors">资产快照</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">工具</h4>
              <ul className="space-y-2">
                <li><Link href="/export" className="hover:text-blue-400 transition-colors">数据导出</Link></li>
                <li><Link href="/record/add" className="hover:text-blue-400 transition-colors">快速记账</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">账户</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/login" className="hover:text-blue-400 transition-colors">登录</Link></li>
                <li><Link href="/auth/register" className="hover:text-blue-400 transition-colors">注册</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© 2026 Geldborse. 保留所有权利。</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
