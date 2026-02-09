"use server";

import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Fetch user from Postgres
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) {
    // In a real app, you'd return an error message here
    return console.error("User not found");
  }

  // 2. Check if password is correct
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return console.error("Invalid password");
  }

  // 3. Redirect to the main dashboard/home
  // For Lumina, this might be your routing dashboard
  redirect("/dashboard"); 
}