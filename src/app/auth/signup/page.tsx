"use client";

import Button from "@/components/Button";
import { LoadingRelative } from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import { base64encode } from "@/lib/crypto";
import { useState } from "react";

enum SignUpStatus {
  IDLE,
  SUCCESS,
  ERROR,
  USER_EXISTS,
  LOADING,
}

export default function SignUpPage() {
  // States for email and password
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(SignUpStatus.IDLE);

  // onSubmit function
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus(SignUpStatus.LOADING);

    // Check if the user already exists
    const encodedEmail = base64encode(email);
    const userResponse = await fetch(`/api/users/${encodedEmail}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log(userResponse);

    // If the user already exists, return an error
    if (userResponse.ok) {
      setStatus(SignUpStatus.USER_EXISTS);
      return;
    }

    // Send an api request to the server to create a new user
    const emailResponse = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // If the response is ok, redirect to the login page
    emailResponse.ok
      ? setStatus(SignUpStatus.SUCCESS)
      : setStatus(SignUpStatus.ERROR);
  };

  return (
    <MainWrapper className="gap-2 w-full">
      <h1 className="text-6xl font-thin my-7 uppercase">Sign up</h1>
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
        <Button type="submit" disabled={status === SignUpStatus.LOADING}>
          {status === SignUpStatus.LOADING ? (
            <LoadingRelative className="w-5 h-5" />
          ) : (
            "Sign up"
          )}
        </Button>
        <SignInWithGoogleButton />
      </form>

      {/* Success/Error messages */}
      {status === SignUpStatus.SUCCESS && (
        <p className="text-green-500">
          An email has been sent to {email}. Check your inbox for a link to
          create your account.
        </p>
      )}
      {status === SignUpStatus.ERROR && (
        <p className="text-red-500">An error has occurred. Please try again.</p>
      )}
      {status === SignUpStatus.USER_EXISTS && (
        <p className="text-red-500">
          An user with this email already exists.{" "}
          <a href="/auth/signin" className="underline">
            Sign in
          </a>
        </p>
      )}
    </MainWrapper>
  );
}
