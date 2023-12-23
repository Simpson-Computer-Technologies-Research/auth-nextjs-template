import { signIn } from "next-auth/react";
import Button from "./Button";
import GoogleSvg from "./svgs/GoogleSvg";

export default function SignInButton(props: {
  className?: string;
}): JSX.Element {
  return (
    <Button className={props.className} onClick={() => signIn("google")}>
      <GoogleSvg /> Login with Google
    </Button>
  );
}
