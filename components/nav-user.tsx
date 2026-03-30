'use client';

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavUser() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-gray-200 p-1 transition-all hover:bg-gray-50"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`/avatars/${user?.id || "default"}.svg`}
              alt={user?.name || "User"}
              onError={(e) => {
                e.currentTarget.src = "/avatars/default.svg";
              }}
            />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" side="top">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <span className="flex items-center gap-2">
            <span className="text-sm font-medium">{user?.name || user?.email}</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="text-sm text-gray-500">{user?.email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
          <span className="flex items-center gap-2">
            <span>Edit Profile</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.location.href = "/settings/security"}>
          <span className="flex items-center gap-2">
            <span>Security</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <span className="flex items-center gap-2">
            <span>Logout</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
