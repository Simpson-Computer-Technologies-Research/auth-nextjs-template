"use client";

import Button from "@/components/Button";
import { LoadingRelative } from "@/components/Loading";
import MainWrapper from "@/components/MainWrapper";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import { base64decode, sha256 } from "@/lib/crypto";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

enum AuthStatus { // Inherits stattes from the Status enum
  IDLE,
  SUCCESS,
  LOADING,
  ERROR,
  INVALID_TOKEN,
}

export default function SignUpPage() {
  const [status, setStatus] = useState(AuthStatus.IDLE);
  const [email, setEmail] = useState("");

  // Router to get the provided data
  const path = usePathname();

  useEffect(() => {
    const data = path.split("/").pop();

    // If the data is invalid or not of type string, return an error
    if (!data) {
      setStatus(AuthStatus.ERROR);
      return;
    }

    // Base64 decode the data
    const decodedData = base64decode(data);
    const { email: _email, token } = JSON.parse(decodedData);
    setEmail(_email);

    // Check if the provided token was create in the past 10 minutes
    fetch("/api/auth/token/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: _email, token }),
    }).then((res) => {
      if (!res.ok) {
        setStatus(AuthStatus.INVALID_TOKEN);
      }
    });
  });

  // When the user submits the form, send an api request to create their account
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(true);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus(AuthStatus.LOADING);

    // If the password is invalid, return an error
    if (!validPassword) {
      setStatus(AuthStatus.ERROR);
      return;
    }

    // Send an api request to create the user's account
    const encryptedPassword = await sha256(password);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: encryptedPassword }),
    });

    res.ok ? setStatus(AuthStatus.SUCCESS) : setStatus(AuthStatus.ERROR);
  };

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
          onChange={(e) => setValidPassword(e.target.value === password)}
          className="border border-black p-3 text-sm"
        />
        <Button
          type="submit"
          disabled={
            !password || status === AuthStatus.SUCCESS || !validPassword
          }
        >
          {status === AuthStatus.LOADING ? (
            <LoadingRelative className="w-5 h-5" />
          ) : (
            "Sign up"
          )}
        </Button>
        <SignInWithGoogleButton />
      </form>

      {/* Success/Error messages */}
      <p className="text-red-500">
        {!validPassword && "Passwords do not match."}
      </p>
      <a href="/auth/signin" className="text-green-500">
        {status === AuthStatus.SUCCESS && (
          <p className="text-green-500">
            Your account has been created. Click{" "}
            <a href="/auth/signin" className="underline">
              here
            </a>{" "}
            to sign in.
          </p>
        )}
      </a>
      <p className="text-red-500">
        {status === AuthStatus.ERROR &&
          "Something went wrong. Please try again."}
      </p>
    </MainWrapper>
  );
}
