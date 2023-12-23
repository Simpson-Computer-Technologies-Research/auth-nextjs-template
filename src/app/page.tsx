"use client";

import Button from "@/components/Button";
import LoadingCenter from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignOutButton from "@/components/SignOutButton";
import { SessionProvider, useSession } from "next-auth/react";
import Link from "next/link";

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
        <SignOutButton />
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Button link={true} href="/api/auth/signin">
        Sign in
      </Button>
    </MainWrapper>
  );
}
