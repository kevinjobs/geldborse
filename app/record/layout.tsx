import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "收支记录 - Geldborse",
  description: "查看和管理你的所有收支记录",
};

export default function RecordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}