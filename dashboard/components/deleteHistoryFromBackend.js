"use server"

export default async function deleteFromBackend(url, token) {
    const req = await fetch("https://alexa-youtube.cafe-setaria.net/users/histories", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify({ "url": url })
    });
    return await req.json();
}