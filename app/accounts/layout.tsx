import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "账户管理 - Geldborse",
  description: "管理你的财务账户、资产和余额快照",
};

export default function AccountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}