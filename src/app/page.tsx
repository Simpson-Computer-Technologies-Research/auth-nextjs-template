"use client";

import Button from "@/components/Button";
import LoadingCenter from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignOutButton from "@/components/SignOutButton";
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
        <SignOutButton />
      </MainWrapper>
    );
  }

  return (
    <MainWrapper className="gap-2 w-full">
      <h1 className="text-6xl font-thin my-7 uppercase">Next Auth Template</h1>
      <Button href="/auth/signin" className="w-full">
        Sign in
      </Button>
      <Button href="/auth/signup" className="w-full">
        Sign up
      </Button>
    </MainWrapper>
  );
}
