import type { ReactNode } from "react";

export function Main({ children }: { children: ReactNode }) {
  return <main className="main-content" id="discover">{children}</main>;
}
