"use client";
import { Inter } from "next/font/google";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTv, faStar, faClockRotateLeft, faList, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import "./globals.css";
import Link from "next/link";
import { useState } from "react";
import logout from "@/app/logout";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const handleLogout = async () => {
    logout();
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="header" className="w-full border-b border-gray-200 fixed top-0 bg-white z-10">
          <div className="mx-auto flex justify-between p-4">
            <h1 className="text-2xl">Woofer Audio Player</h1>
            <nav className="hidden md:block">
              <p className="text-red-600">
                <a className="cursor-pointer" onClick={handleLogout}>Logout</a>
              </p>
            </nav>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>
        <div className="pt-16 md:flex min-h-screen">
          <div id="sidemenu" className={`md:w-64 border-r relative shrink-0 bg-white fixed md:static border-b-2 ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
            <nav className="md:w-64 flex flex-col justify-between h-full">
              <ul className="w-full">
                <li className="border-b w-full">
                  <Link href="/" className="w-full p-4 pl-8 inline-block"><FontAwesomeIcon icon={faTv} className="mr-2"/>Top</Link>
                </li>
                <li className="border-b w-full">
                  <Link href="/favorite" className="w-full p-4 pl-8 inline-block"><FontAwesomeIcon icon={faStar} className="mr-2"/>Favorite</Link>
                </li>
                <li className="border-b w-full">
                  <Link href="/history" className="w-full p-4 pl-8 inline-block"><FontAwesomeIcon icon={faClockRotateLeft} className="mr-2"/>History</Link>
                </li>
              </ul>
              <div className="border-t w-full">
                <a onClick={handleLogout} className="w-full p-4 pl-8 inline-block text-red-600 cursor-pointer"><FontAwesomeIcon icon={faSignOutAlt} className="mr-2"/>Logout</a>
              </div>
            </nav>
          </div>
          <div className="flex-1 p-4 md:w-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}