"use client";

import Button from "@/components/Button";
import { LoadingRelative } from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import { base64decode, sha256 } from "@/lib/crypto";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

enum AuthStatus {
  IDLE,
  SUCCESS,
  LOADING,
  ERROR,
  INVALID_TOKEN,
}

async function isValidTokenApi(email: string, token: string) {
  const res = await fetch("/api/auth/token/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });

  return res.ok;
}

async function createUserApi(email: string, password: string) {
  const encryptedPassword = await sha256(password);
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: encryptedPassword }),
  });

  return res.ok;
}

export default function SignUpPage() {
  const [status, setStatus] = useState(AuthStatus.IDLE);
  const [email, setEmail] = useState("");
  const path = usePathname();

  useEffect(() => {
    if (status !== AuthStatus.IDLE) {
      return;
    }

    // Get the encoded data from the path
    const data = path.split("/").pop();
    if (!data) {
      return setStatus(AuthStatus.INVALID_TOKEN);
    }

    // Base64 decode the data
    const decodedData = base64decode(data);
    const { email: _email, token } = JSON.parse(decodedData);
    setEmail(_email);

    // Check if the provided token was create in the past 10 minutes
    isValidTokenApi(_email, token).then((res) => {
      if (!res) {
        return setStatus(AuthStatus.INVALID_TOKEN);
      }
    });
  });

  // When the user submits the form, send an api request to create their account
  const [password, setPassword] = useState("");
  const [verificationPassword, setVerificationPassword] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus(AuthStatus.LOADING);

    // If the password is invalid, return an error
    if (password !== verificationPassword) {
      return setStatus(AuthStatus.ERROR);
    }

    // Send an api request to create the user's account
    const res = await createUserApi(email, password);
    res ? setStatus(AuthStatus.SUCCESS) : setStatus(AuthStatus.ERROR);
  };

  // Check if the token is valid. If not, return an error message to the user
  if (status === AuthStatus.INVALID_TOKEN) {
    return (
      <MainWrapper className="gap-2 w-full">
        <h1 className="text-6xl font-thin my-7 uppercase">INVALID TOKEN</h1>
        <p className="text-red-500 mb-4">
          The token provided is invalid or has expired.
        </p>
        <Button href="/auth/signup">Sign up</Button>
      </MainWrapper>
    );
  }

  // Store whether the submission button should be disabled
  const disableSubmitButton =
    !password ||
    password !== verificationPassword ||
    status === AuthStatus.SUCCESS;

  // If the token is valid, return the password form
  return (
    <MainWrapper className="gap-2 w-full">
      <h1 className="text-6xl font-thin my-7 uppercase">Sign up</h1>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={async (e) => await onSubmit(e)}
      >
        <input
          value={email}
          disabled={true}
          className="border border-black p-3 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-black p-3 text-sm"
        />
        <input
          type="password"
          placeholder="Verify Password"
          onChange={(e) => setVerificationPassword(e.target.value)}
          className="border border-black p-3 text-sm"
        />

        <Button type="submit" disabled={disableSubmitButton}>
          {status === AuthStatus.LOADING ? (
            <LoadingRelative className="w-5 h-5" />
          ) : (
            "Sign up"
          )}
        </Button>

        <SignInWithGoogleButton />
      </form>

      {/* If the inputted passwords don't match, return an error */}
      {password !== verificationPassword && (
        <p className="text-red-500">Passwords do not match.</p>
      )}

      {/* The sign up was a success - they can now sign in */}
      {status === AuthStatus.SUCCESS && (
        <p className="text-green-500">
          Your account has been created.{" "}
          <a href="/auth/signin" className="underline hover:text-green-600">
            Sign in
          </a>
        </p>
      )}

      {/* An error has occurred - most likely an internal error */}
      <p className="text-red-500">
        {status === AuthStatus.ERROR &&
          "Something went wrong. Please try again."}
      </p>
    </MainWrapper>
  );
}
