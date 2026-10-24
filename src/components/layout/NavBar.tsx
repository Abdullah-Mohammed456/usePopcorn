import type { ReactNode } from "react";

export function NavBar({ children }: { children: ReactNode }) {
  return <header className="nav-bar">{children}</header>;
}
