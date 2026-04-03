import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数据导出 - Geldborse",
  description: "导出你的财务数据，支持PDF、Excel、图片等多种格式",
};

export default function ExportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}