import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "设置 - Geldborse",
  description: "管理你的账户设置和个人信息",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}