import TopList from "@/components/TopList";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Woofer - Dashboard",
  description: "Woofer Audio Player",
};


export default async function Home() {
  const cookieStore = cookies();
  const req = await fetch("https://alexa-youtube.cafe-setaria.net/users/favorites", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": cookieStore?.get("token")?.value,
    },
  });
  const favorites = await req.json();
  
  if (favorites.status === "error") {
    return redirect("/login");
  }
  const req2 = await fetch("https://alexa-youtube.cafe-setaria.net/users/histories", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": cookieStore?.get("token")?.value,
    },
  });
  const history = await req2.json();
  
  return (
    <main className="grow">
      <div className="px-4 pt-8 md:px-8 lg:px-20 md:pt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="border">
              <nav className="flex justify-between items-center p-4">
                <h2 className="text-xl md:text-2xl">Favorite</h2>
                <Link href="/favorite" className="text-blue-600">more</Link>
              </nav>
              <div className="border m-4">
                {favorites.map((item) => (
                  <TopList key={item.url} videoTitle={item.title} thumbnail={item.thumbnail} videoUrl={item.url} />
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="border">
              <nav className="flex justify-between items-center p-4">
                <h2 className="text-xl md:text-2xl">History</h2>
                <Link href="/history" className="text-blue-600">more</Link>
              </nav>
              <div className="border m-4">
                {history.map((item) => (
                  <TopList key={item.url} videoTitle={item.title} thumbnail={item.thumbnail} videoUrl={item.url} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}