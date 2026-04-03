import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "快照管理 - Geldborse",
  description: "查看和管理你的资产快照记录",
};

export default function SnapshotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}