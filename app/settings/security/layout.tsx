import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "安全设置 - Geldborse",
  description: "管理你的账户安全设置",
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}