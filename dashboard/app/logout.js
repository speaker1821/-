"use server"
import { cookies } from "next/headers";

export default async function logout() {
    const cookieStore = cookies();
    cookieStore.delete("token");
}