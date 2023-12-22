import { ReactNode } from "react";

export default function MainWrapper({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {children}
    </main>
  );
}
