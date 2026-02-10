"use server";

import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { signSession } from "@/lib/jwt";

export async function handleLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) {
    console.error("User not found");
    redirect("/login");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.error("Invalid password");
    redirect("/login");
  }

  // JWT session
  const token = signSession({
    sub: String(user.id),
    email: user.email,
    name: user.name,
  });

  // Store JWT in HttpOnly cookie
  (await
    // Store JWT in HttpOnly cookie
    cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 2 * 60, // 2 minutes
  });

  redirect("/dashboard");
}
