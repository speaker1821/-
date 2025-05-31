"use client";

import onclick from "@/app/oauth2/onclick";

export default function OAuthButton({redirect_uri, state, client_id}) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <p className="text-gray-800 text-center mb-4">Alexaとの連携を許可しますか？</p>
        <a
            onClick={(e) => {
                onclick(redirect_uri, state, client_id);
            }}
            className="block text-center text-white bg-red-600 hover:bg-red-700 p-2 rounded cursor-pointer"
            href="#"
        >
            許可
        </a>
    </div>
    )
}