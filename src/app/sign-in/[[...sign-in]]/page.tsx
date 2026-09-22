import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <SignIn 
        appearance={{
          elements: {
            card: 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl rounded-2xl',
            headerTitle: 'text-[var(--text-primary)] font-bold',
            headerSubtitle: 'text-[var(--text-secondary)]',
            formButtonPrimary: 'btn-pill-primary bg-[var(--primary-purple)] hover:bg-[var(--primary-purple-hover)]',
          }
        }}
      />
    </div>
  );
}
