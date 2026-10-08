"use client";

import { useState } from "react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function TwoFactorToggle() {
  const session = authClient.useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  const isEnabled = session.data?.user.twoFactorEnabled ?? false;

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open && !isPending) setPassword("");
  };

  const handleToggle = (enabled: boolean) => {
    setIsEnabling(enabled);
    setDialogOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      toast.error("Enter your password to continue");
      return;
    }

    setIsPending(true);
    try {
      const result = isEnabling
        ? await authClient.twoFactor.enable({ password })
        : await authClient.twoFactor.disable({ password });

      if (result.error) {
        toast.error(result.error.message || "Could not update two-factor settings");
        return;
      }

      await session.refetch();
      setPassword("");
      setDialogOpen(false);
      toast.success(
        isEnabling
          ? "Email two-factor authentication enabled"
          : "Two-factor authentication disabled",
      );
    } catch (error) {
      console.error("Failed to update two-factor settings", error);
      toast.error("Could not update two-factor settings. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <ShieldCheck size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold">Two-factor authentication</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a one-time email code when signing in to protect your
                account.
              </p>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={session.isPending || !session.data?.user || isPending}
            aria-label="Toggle email two-factor authentication"
          />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <Mail size={14} aria-hidden="true" />
          <span>
            {isEnabled
              ? `Codes will be sent to ${session.data?.user.email}.`
              : "Verification codes will be sent to your registered email."}
          </span>
        </div>
      </section>

      <AlertDialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isEnabling
                  ? "Enable email two-factor authentication?"
                  : "Disable two-factor authentication?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isEnabling
                  ? "We’ll email a one-time verification code whenever you sign in."
                  : "Your account will no longer require an extra verification code when you sign in."}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2">
              <label htmlFor="two-factor-password" className="text-sm font-medium">
                Confirm your password
              </label>
              <Input
                id="two-factor-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your current password"
                disabled={isPending}
                required
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <Button type="submit" disabled={isPending || !password.trim()}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Updating...
                  </>
                ) : isEnabling ? (
                  "Enable"
                ) : (
                  "Disable"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
