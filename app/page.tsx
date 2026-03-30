'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Shield, Star, Zap, DollarSign, LineChart, Clock, CreditCard, Smartphone, Save, BarChart3, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 使用 setTimeout 来避免在 effect 中直接同步调用 setState
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // 根据登录状态决定跳转链接
  const getStartLink = () => {
    return user ? '/overview' : '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">智能财务管理</span>
              <span className="block mt-2 text-indigo-600 dark:text-indigo-400">掌控你的财富未来</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Geldborse 帮助你轻松追踪收支、管理资产、制定预算，让财务管理变得简单而高效。
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                href={getStartLink()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {user ? '进入控制台' : '开始使用'}
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                免费注册
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50 dark:from-indigo-900/20 to-transparent opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-purple-50 dark:from-purple-900/20 to-transparent opacity-30 pointer-events-none" />
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              强大功能，简单操作
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              我们提供全方位的财务管理工具，帮助你实现财务目标
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-md flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">收支追踪</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                轻松记录每一笔收支，自动分类，生成详细报表，让你对自己的财务状况一目了然。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">资产分析</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                全面分析你的资产分布，提供多维度的财务报表和图表，帮助你做出更明智的投资决策。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">预算管理</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                制定个性化预算计划，实时监控支出情况，避免超支，帮助你养成良好的消费习惯。
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-md flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">账户管理</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                集中管理多个银行账户、信用卡和支付平台，统一查看所有财务信息，方便快捷。
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-md flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">移动同步</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                支持多设备同步，随时随地查看和管理你的财务，让财务管理更加灵活便捷。
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-md flex items-center justify-center mb-4">
                <Save className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">数据安全</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                采用银行级加密技术，保护你的财务数据安全，让你可以放心使用。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              用户好评
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              听听我们的用户怎么说
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "Geldborse 让我的财务管理变得轻松简单，我现在对自己的财务状况了如指掌，能够更好地规划未来。"
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">张</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">张先生</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">企业经理</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "作为一名自由职业者，Geldborse 帮助我更好地管理收入和支出，制定合理的预算，让我的财务更加健康。"
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-medium">李</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">李女士</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">自由职业者</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "界面美观，功能强大，操作简单，是我用过的最好的财务管理工具之一。强烈推荐！"
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">王</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">王先生</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">软件工程师</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 dark:bg-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            开始你的财务管理之旅
          </h2>
          <p className="mt-4 text-xl text-indigo-100">
            立即注册，享受 14 天免费试用，无需信用卡
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              免费注册
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md shadow-sm text-white bg-transparent hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              已有账号？登录
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Geldborse</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                智能财务管理工具，让你的财务更健康
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">功能</h3>
              <ul className="mt-2 space-y-2">
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">收支追踪</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">资产分析</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">预算管理</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">账户管理</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">资源</h3>
              <ul className="mt-2 space-y-2">
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">帮助中心</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">使用指南</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">常见问题</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">联系我们</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">法律</h3>
              <ul className="mt-2 space-y-2">
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">隐私政策</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">服务条款</Link></li>
                <li><Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Cookie 政策</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2024 Geldborse. 保留所有权利。
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
