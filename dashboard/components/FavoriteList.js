"use client";

import { useState } from "react";
import deleteFromBackend from "./deleteFavoriteFromBackend";

export default function DetailList({ detail, token }) {
    const [detail_, setDetail] = useState(detail);

    const delete_detail = async (url) => {
        const res = await deleteFromBackend(url, token);
        if (res.status === "success") {
            setDetail(detail_.filter((item) => item.url !== url));
        }
    };

    return (
        <div className="border m-4">
            {detail_.map((item) => (
                <div className="border-b p-4 flex flex-col lg:flex-row items-center justify-between" key={item.url}>
                    <div className="flex items-center w-full">
                        <img
                            src={item.thumbnail}
                            alt="Cover"
                            className="h-8 lg:h-12"
                        />
                        <p className="text-ellipsis overflow-hidden whitespace-nowrap m-2 flex-1">
                            <a href={item.url} className="block lg:inline">{item.title}</a>
                        </p>
                    </div>
                    <a
                        onClick={(e) => { e.preventDefault(); delete_detail(item.url); }}
                        className="text-red-600 cursor-pointer mt-2 lg:mt-0"
                    >
                        Delete
                    </a>
                </div>
            ))}
        </div>
    );
}