import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "添加收支 - Geldborse",
  description: "添加新的收支记录",
};

export default function RecordAddLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}