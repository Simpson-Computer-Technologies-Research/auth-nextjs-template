import { signIn } from "next-auth/react";
import Button from "./Button";
import GoogleSvg from "./svgs/GoogleSvg";

export default function SignInWithGoogleButton(props: {
  className?: string;
}): JSX.Element {
  return (
    <Button
      className={props.className}
      onClick={() => signIn("google", { redirect: true, callbackUrl: "/" })}
    >
      <GoogleSvg /> Login with Google
    </Button>
  );
}
