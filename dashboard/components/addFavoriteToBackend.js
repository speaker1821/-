"use server"

import { redirect } from "next/navigation";

export default async function addFavoriteToBackend(url, token) {
    
    const req = await fetch("https://alexa-youtube.cafe-setaria.net/users/favorites", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify({ "url": url })
    });
    const ret = await req.json();
    
    if (ret.status === "error") {
        return {status: "error", message: "Error: this video is already in your favorite list"};
    } else {
        return {status: "success", message: "Success: this video has been added to your favorite list. Please refresh this page."};
    }
}