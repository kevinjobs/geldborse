import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "注册 - Geldborse",
  description: "创建一个新的Geldborse账户",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}