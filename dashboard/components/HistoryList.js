"use client"

import { useState } from "react";
import deleteFromBackend from "./deleteHistoryFromBackend";
export default function DetailList({ detail, token }) {
    const [detail_, setDetail] = useState(detail);
    const delete_detail = async (url) => {
        const res = await deleteFromBackend(url, token);
        if (res.status === "success") {
            setDetail(detail_.filter((item) => item.url !== url));
        }
    }
    return (
        <div className="border m-4">
            {detail_.map((item) => (
                <div className="border-b p-4 flex items-center justify-between" key={item.url}>
                    <div className="flex items-center w-full">
                        <img
                            src={item.thumbnail}
                            alt="Cover 1"
                            className="h-8"
                        />
                        <p className="text-ellipsis overflow-hidden whitespace-nowrap m-2"><a href={item.url}>{item.title}</a></p>
                    </div>
                    <a onClick={(e) => { e.defaultPrevented; delete_detail(item.url) }} className="text-red-600 cursor-pointer">Delete</a>
                </div>
            ))}
        </div>
    )
}