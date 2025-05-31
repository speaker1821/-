"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
};
export default async function login(prevState, formData, params) {
    if (!formData.get("username").match(/^[A-Za-z0-9]*$/)) {
        return { message: "Invalid username" };
    }

    const cookieStore = cookies();
    const req = await fetch("https://alexa-youtube.cafe-setaria.net/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userid: formData.get("username"),
            password: formData.get("password"),
        }),
    });
    const token = await req.json();
    
    if (token.status === "error") {
        return { message: "Invalid username or password" };
    }
    cookieStore.set({ name: "token", value: token.token, ...cookieOptions });
    if (params.redirect === "oauth2") {
        return redirect("/oauth2?redirect_uri=" + params.redirect_uri + "&client_id=" + params.client_id + "&response_type=" + params.response_type + "&state=" + params.state);
    }
    return redirect("/");
}