"use client";

import LoadingCenter from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignInButton from "@/components/SignInButton";
import { SessionProvider, useSession } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      <Main />
    </SessionProvider>
  );
}

function Main(): JSX.Element {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingCenter />;
  }

  if (status === "authenticated" && session) {
    return (
      <MainWrapper>
        <h1 className="text-2xl font-bold">Welcome {session.user.name}</h1>
        <p className="text-xl">You are now logged in!</p>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <SignInButton />
    </MainWrapper>
  );
}
