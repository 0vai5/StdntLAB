"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import { useState } from "react";
import { rollbackAuthUser } from "@/lib/supabase/actions";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Step 1: Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
            },
          },
        }
      );

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create account");
        return;
      }

      const userId = authData.user.id;

      // Step 2: Insert into Users table using the auth user ID in user_id field
      // Check if user already exists (in case database trigger created it)
      const { data: existingUser } = await supabase
        .from("Users")
        .select("user_id")
        .eq("user_id", userId)
        .single();

      if (!existingUser) {
        // User doesn't exist, insert it with the auth user ID in user_id field
        const { error: insertError } = await supabase.from("Users").insert({
          user_id: userId,
          email: data.email,
          name: data.name,
        });

        if (insertError) {
          // Step 3: Rollback - delete auth user if Users insert fails
          console.error("Error inserting into Users table:", insertError);
          toast.error(
            `Failed to create user record: ${insertError.message}. Rolling back...`
          );

          const rollbackResult = await rollbackAuthUser(userId);
          if (rollbackResult.success) {
            toast.error(
              "User creation failed and has been rolled back. Please try again."
            );
          } else {
            toast.error(
              `User creation failed. Rollback also failed: ${rollbackResult.error}. Please contact support.`
            );
            console.error(
              `Failed to rollback auth user ${userId}. Manual cleanup may be required.`
            );
          }
          return;
        }
      } else {
        // User already exists (likely created by trigger), update name if needed
        const { error: updateError } = await supabase
          .from("Users")
          .update({ name: data.name })
          .eq("user_id", userId);

        if (updateError) {
          console.warn("User exists but failed to update name:", updateError);
          // Don't rollback here since user was created successfully
        }
      }

      toast.success("Account created successfully!");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
              disabled={isLoading}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="you@example.com"
              {...register("email")}
              disabled={isLoading}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password")}
              disabled={isLoading}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner size="sm" className="mr-2" />}
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
