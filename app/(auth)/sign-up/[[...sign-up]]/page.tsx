import { SignUp } from "@clerk/nextjs";

/**
 * The sign-up page component.
 *
 * This component renders a sign-up form to the user, allowing them to create a new account.
 *
 * @returns The sign-up form component.
 */
export default function Page() {
  return <SignUp />;
}
