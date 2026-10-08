"use client";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  // email: z.string().regex(/^\S+@\S+\.\S+$/, "Invalid email address"),
  username: z.string().min(1, "Username is required"),
  password: z.string(),
});

const SignInForm = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const finishSignIn = (roleValue?: string | null, username?: string | null) => {
    const role = roleValue?.toUpperCase() ?? "CASHIER";
    toast.success(
      `Logged in successfully! Welcome back, ${username ?? "user"} (${role})!`,
    );
    if (role === "CASHIER") {
      router.push("/dashboard/pos");
    } else {
      router.push("/dashboard");
    }
  };

  const sendOtp = async () => {
    try {
      const result = await authClient.twoFactor.sendOtp({});
      if (result.error) {
        toast.error(
          result.error.message || "Could not send a verification code",
        );
        return false;
      }
      toast.success("A verification code was sent to your email");
      return true;
    } catch (error) {
      console.error("Failed to send sign-in OTP", error);
      toast.error("Could not send a verification code. Please try again.");
      return false;
    }
  };

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    await authClient.signIn.username(
      {
        username: formData.username,
        password: formData.password,
      },
      {
        onRequest: () => {
          setIsSigningIn(true);
        },
        onSuccess: async (ctx) => {
          if (
            "twoFactorRedirect" in ctx.data &&
            ctx.data.twoFactorRedirect
          ) {
            setIsSigningIn(false);
            setRequiresOtp(true);
            await sendOtp();
            return;
          }

          setIsSigningIn(false);
          finishSignIn(ctx.data.user.role, ctx.data.user.username);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Invalid credentials! Try again.");
          setIsSigningIn(false);
        },
      },
    );
  };

  const onVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsVerifyingOtp(true);
    try {
      const result = await authClient.twoFactor.verifyOtp({ code: otp.trim() });
      if (result.error) {
        toast.error(result.error.message || "Invalid verification code");
        return;
      }
      if (!result.data) {
        toast.error("Could not verify the code. Please try again.");
        return;
      }
      finishSignIn(result.data.user.role, result.data.user.username);
    } catch (error) {
      console.error("Failed to verify sign-in OTP", error);
      toast.error("Could not verify the code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const onResendOtp = async () => {
    setIsSendingOtp(true);
    try {
      await sendOtp();
    } catch (error) {
      console.error("Failed to resend sign-in OTP", error);
      toast.error("Could not resend the verification code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <div className="w-full">
      {requiresOtp ? (
        <>
          <h1 className="text-md font-semibold my-4">
            Enter your verification code
          </h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Check your registered email for the one-time code.
          </p>
          <form onSubmit={onVerifyOtp}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="sign-in-otp">Verification code</FieldLabel>
                <Input
                  id="sign-in-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit code"
                  required
                />
              </Field>
              <Button
                type="submit"
                disabled={isVerifyingOtp || otp.trim().length !== 6}
                className="w-full"
              >
                {isVerifyingOtp ? (
                  <Spinner />
                ) : (
                  <LogIn className="mr-2" size={16} />
                )}
                {isVerifyingOtp ? "Verifying..." : "Verify and sign in"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSendingOtp}
                onClick={onResendOtp}
                className="w-full"
              >
                {isSendingOtp ? <Spinner /> : null}
                {isSendingOtp ? "Sending..." : "Resend code"}
              </Button>
            </FieldGroup>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-md font-semibold my-4">Sign In to your account</h1>
          <form id="login_form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      {...field}
                      id="username"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button type="submit" disabled={isSigningIn} className="w-full">
                {isSigningIn ? (
                  <Spinner />
                ) : (
                  <LogIn className="mr-2" size={16} />
                )}
                {isSigningIn ? "Signing In..." : "Sign In"}
              </Button>
            </FieldGroup>
          </form>
        </>
      )}
    </div>
  );
};

export default SignInForm;
