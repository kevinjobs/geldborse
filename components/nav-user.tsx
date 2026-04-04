'use client';

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

export function NavUser() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // 注销成功后手动跳转到登录页面
      router.push('/auth/login');
    } catch (error) {
      console.error("退出登录错误:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-border bg-background p-1 transition-all hover:bg-accent focus:outline-none focus:ring-0"
          aria-label="用户菜单"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`/avatars/${user?.id || "default"}.svg`}
              alt={user?.name || "用户"}
              onError={(e) => {
                e.currentTarget.src = "/avatars/default.svg";
              }}
            />
            <AvatarFallback>
              {typeof window !== 'undefined' ? (user?.name?.charAt(0).toUpperCase() || "U") : "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-50" side="top" sideOffset={8} onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>
          我的账户
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-default">
          <span className="flex items-center gap-2">
            <span className="text-sm font-medium">{user?.name || user?.email}</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-default">
          <span className="text-sm text-gray-500">{user?.email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          编辑个人资料
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings/security")}>
          安全设置
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
