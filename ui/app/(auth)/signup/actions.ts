"use server";

import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt"; 

export async function handleSignUp(formData: FormData): Promise<void> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const rawPassword = formData.get("password") as string;
  const sol_addr = formData.get("sol_addr") as string;
  const preferred_currency = formData.get("preferred_currency") as string;

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  try {
    await query(
      `INSERT INTO users (name, email, password, sol_addr, preferred_currency)
        VALUES ($1, $2, $3, $4, $5)`,
      [name, email, hashedPassword, sol_addr, preferred_currency]
    );
  } catch (error) {
    console.error("Database Error:", error);
  }

  redirect("/login");
}