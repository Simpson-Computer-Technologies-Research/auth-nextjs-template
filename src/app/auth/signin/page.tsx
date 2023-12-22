"use client";

import MainWrapper from "@/components/MainWrapper";
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

  // onSubmit function
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });
  };

  return (
    <MainWrapper>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => await onSubmit(e)}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-2 rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-2 rounded-md"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          Login
        </button>
      </form>
    </MainWrapper>
  );
}
