
import DetailList from "@/components/FavoriteList";
import NewFavorite from "@/components/NewFavorite";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Woofer - Dashboard",
    description: "Woofer Audio Player",
};

export default async function Home() {
    const cookieStore = cookies();
    const token = cookieStore?.get("token")?.value;
    const req = await fetch("https://alexa-youtube.cafe-setaria.net/users/favorites", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
    });
    const favorites = await req.json()
    if (favorites.status === "error") {
        return redirect("/login");
    }

    return (
        <main className="grow">
            <div className="px-4 pt-8 md:px-8 lg:px-20 md:pt-16">
                <div className="">
                    <div>
                        <div id="favorite" className="border">
                            <nav className="flex justify-between items-center p-4">
                                <h2 className="text-2xl">Favorite</h2>
                            </nav>
                            <NewFavorite token={token} />
                            <DetailList detail={favorites} token={token} />
                        </div>
                    </div>
                </div>
            </div>
        </main>

    );
}
