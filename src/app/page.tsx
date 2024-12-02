import { SignInButton } from '@/components/auth/sign-in-button';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-3xl mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to AI Companion</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Your personal AI companion for engaging conversations and helpful assistance
      </p>
      <SignInButton />
    </div>
  );
}
