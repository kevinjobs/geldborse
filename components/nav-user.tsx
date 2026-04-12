'use client';

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function NavUser() {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    router.push("/settings");
  };

  return (
    <div className="w-full group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0">
      <button
        className="w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
        aria-label="个人设置"
        onClick={handleClick}
      >
        <Avatar className="h-9 w-9 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
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
        <div className="flex-1 text-left group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-medium">{user?.name || user?.email}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </button>
    </div>
  );
}
