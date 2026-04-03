import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "密码设置 - Geldborse",
  description: "修改你的账户密码",
};

export default function PasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}