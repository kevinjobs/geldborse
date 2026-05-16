import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "总览 - Geldborse",
  description: "查看你的财务概览，包括总资产、最近收支和账户汇总",
};

export default function OverviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}