"use server";
import { redirect } from "next/navigation";
import onclick from "./onclick";
import OAuthButton from "@/components/OAuthButton";
import { cookies } from "next/headers";
export default async function OAuth({searchParams}) {
    const redirect_uri = searchParams?.redirect_uri
    const client_id = searchParams?.client_id
    const response_type = searchParams?.response_type
    const state = searchParams?.state

    const cookieStore = cookies();
    const token = cookieStore?.get("token");
    if (!token) {
        return redirect("/login?redirect=oauth2&redirect_uri=" + redirect_uri + "&client_id=" + client_id + "&response_type=" + response_type + "&state=" + state);
    }
    const req = await fetch("https://alexa-youtube.cafe-setaria.net/isloggedin", {
        headers: {
            "Content-Type": "application/json",
            "Authorization": token?.value,
        },
    });
    const isLoggedin = await req.json();
    
    
    if (isLoggedin.status === "error") {
        return redirect("/login?redirect=oauth2&redirect_uri=" + redirect_uri + "&client_id=" + client_id + "&response_type=" + response_type + "&state=" + state);
    }
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <OAuthButton redirect_uri={redirect_uri} state={state} client_id={client_id} />
        </main>
    )
}