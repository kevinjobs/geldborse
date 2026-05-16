'use client';

import { useState } from 'react';
import { ArrowLeft, Lock, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
        return;
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      router.push('/auth/login');
    } catch (err) {
      setError('An error occurred. Please try again.');
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
            <CardTitle className="text-2xl">注册</CardTitle>
            <CardDescription>
              创建一个新账户开始管理你的财务
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
                <Label htmlFor="name">姓名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#98989D]" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="你的姓名"
                    className="pl-10"
                  />
                </div>
              </div>
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
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#98989D]" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少8个字符"
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#121212] font-medium" disabled={loading}>
                {loading ? '注册中...' : '注册'}
              </Button>
              <div className="text-center text-sm text-[#98989D]">
                已经有账户？
                <Link href="/auth/login" className="text-[#00E5FF] hover:underline ml-1">
                  登录
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
