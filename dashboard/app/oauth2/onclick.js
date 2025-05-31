"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function onclick(redirect_uri, state, client_id) {
    const cookieStore = cookies();
    const req1 = await fetch("https://alexa-youtube.cafe-setaria.net/isloggedin", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": cookieStore?.get("token")?.value,
        },
    });
    const isloggedin = await req1.json();
    if (isloggedin.status === "error") {
        return redirect("/login");
    }
    const req = await fetch("https://alexa-youtube.cafe-setaria.net/oauth2/createtoken", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": cookieStore?.get("token")?.value,
        },
        body: JSON.stringify({
            redirect_uri: redirect_uri,
            state: state,
            client_id: client_id,
        }),
    });
    const code = await req.json();
    redirect(`${redirect_uri}?code=${code.code}&state=${state}`);
}