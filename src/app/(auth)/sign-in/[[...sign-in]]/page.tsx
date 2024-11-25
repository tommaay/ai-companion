import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
      <SignIn />
    </div>
  );
}
