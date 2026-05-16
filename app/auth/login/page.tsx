'use client';

import { useState } from 'react';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/overview');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '16px', paddingTop: 'calc(50vh - 200px)' }}>
        <Card className="block">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="hover:text-[#00E5FF] transition-colors">
                <ArrowLeft className="h-5 w-5 text-[#98989D]" />
              </Link>
              <h1 className="text-xl font-bold text-white">
                Geldborse
              </h1>
            </div>
            <CardTitle className="text-2xl">登录</CardTitle>
            <CardDescription>
              输入你的邮箱和密码登录到你的账户
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-[#3A1C1C] text-[#FF453A] rounded-[8px] border-l-[3px] border-l-[#FF453A]">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#98989D]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密码</Label>
                  <Link href="#" className="text-sm text-[#00E5FF] hover:underline">
                    忘记密码？
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#98989D]" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#121212] font-medium" disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </Button>
              <div className="text-center text-sm text-[#98989D]">
                还没有账户？
                <Link href="/auth/register" className="text-[#00E5FF] hover:underline ml-1">
                  注册
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
