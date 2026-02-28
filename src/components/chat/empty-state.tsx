import { Logo } from "@/components/common/logo";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <Logo size={32} animated />
      <div>
        <h2 className="text-lg font-semibold">Start a new conversation</h2>
        <p className="text-sm text-muted-foreground">
          Ask about campaigns, leads, or anything GTM related.
        </p>
      </div>
    </div>
  );
}
