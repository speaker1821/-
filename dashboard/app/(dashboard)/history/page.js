
import DetailList from "@/components/HistoryList";
import Image from "next/image";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Woofer - Dashboard",
  description: "Woofer Audio Player",
};


export default async function Home() {
  const cookieStore = cookies();
  const token = cookieStore?.get("token")?.value;
  const req = await fetch("https://alexa-youtube.cafe-setaria.net/users/histories", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token,
    }
  });
  const history = await req.json();
  if (history.status === "error") {
    return redirect("/login");
  }
  return (
    <main className="grow">
      <div className="px-4 pt-8 md:px-8 lg:px-20 md:pt-16">
        <div className="">
          <div>
            <div className="border">
              <nav className="flex justify-between items-center p-4">
                <h2 className="text-2xl">History</h2>
              </nav>
              <DetailList detail={history} token={token} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
