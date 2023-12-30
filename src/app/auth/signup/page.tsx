"use client";

import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import { LoadingRelative } from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import SuccessMessage from "@/components/SuccessMessage";
import { base64encode } from "@/lib/crypto";
import { useState } from "react";

enum SignUpStatus {
  IDLE,
  SUCCESS,
  ERROR,
  USER_EXISTS,
  LOADING,
}

function userAlreadyExistsApi(email: string) {
  const encodedEmail = base64encode(email);
  return fetch(`/api/users/${encodedEmail}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

function sendEmailApi(email: string) {
  return fetch("/api/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
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
    const userResponse = await userAlreadyExistsApi(email);
    if (userResponse.ok) {
      // If the user already exists, return an error
      return setStatus(SignUpStatus.USER_EXISTS);
    }

    // Send an api request to send a verification email to the provided mail address
    const emailResponse = await sendEmailApi(email);
    emailResponse.ok // If the response is ok, set the status to success, else to error
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

      {/* The sign up was a success - they must check their email for verification */}
      {status === SignUpStatus.SUCCESS && (
        <SuccessMessage>
          An email has been sent to {email}. Check your inbox for a link to
          create your account.
        </SuccessMessage>
      )}

      {/* An error has occurred - most likely an internal error */}
      {status === SignUpStatus.ERROR && (
        <ErrorMessage>An error has occurred. Please try again.</ErrorMessage>
      )}

      {/* The user already exists - they must sign in to continue */}
      {status === SignUpStatus.USER_EXISTS && (
        <ErrorMessage>
          An user with this email already exists.{" "}
          <a href="/auth/signin" className="underline">
            Sign in
          </a>
        </ErrorMessage>
      )}
    </MainWrapper>
  );
}
