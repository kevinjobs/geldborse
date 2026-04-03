import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 - Geldborse",
  description: "登录到你的Geldborse账户",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}