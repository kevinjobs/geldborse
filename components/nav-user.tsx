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
        className="w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-sidebar-accent focus:outline-none focus:ring-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
        aria-label="个人设置"
        onClick={handleClick}
      >
        <Avatar className="h-9 w-9 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
          <AvatarImage
            src={user?.avatar}
            alt={user?.name || "用户"}
          />
          <AvatarFallback>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-medium">{user?.name || user?.email}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </button>
    </div>
  );
}
