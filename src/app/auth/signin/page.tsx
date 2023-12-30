"use client";

import Button from "@/components/Button";
import { LoadingRelative } from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import { Status } from "@/lib/types";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SignInPage() {
  // Get the callback url from the query parameters
  const [callbackUrl, setCallbackUrl] = useState("/");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get("callbackUrl");
    if (callbackUrl) setCallbackUrl(callbackUrl);
  }, []);

  // States for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(Status.IDLE);

  // onSubmit function
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus(Status.LOADING);

    await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: true,
    });
  };

  return (
    <MainWrapper className="gap-2 w-full">
      <h1 className="text-6xl font-thin my-7 uppercase">Sign in</h1>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={async (e) => await onSubmit(e)}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-black p-3 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-black p-3 text-sm"
        />
        <a href="/auth/forgot-password" className="underline">
          Forgot password?
        </a>

        <Button type="submit" disabled={status === Status.LOADING}>
          {status === Status.LOADING ? (
            <LoadingRelative className="w-5 h-5" />
          ) : (
            "Sign in"
          )}
        </Button>

        <SignInWithGoogleButton />

        <p className="text-sm">
          Don't have an account?{" "}
          <a href="/auth/signup" className="underline">
            Sign up
          </a>
        </p>
      </form>
    </MainWrapper>
  );
}
