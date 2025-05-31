"use client"
import { useFormState } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import register from "./register-handle";
import { Suspense } from "react";

function Register() {
  const [result, dispatch] = useFormState(handleSubmit, null);
  const search = useSearchParams();
  const params = {
    "redirect": search.get("redirect"),
    "redirect_uri": search.get("redirect_uri"),
    "client_id": search.get("client_id"),
    "response_type": search.get("response_type"),
    "state": search.get("state")
  }

  function handleSubmit(prevState, formData) {
    return register(prevState, formData, params);
  }
  return (
    <div>
      <form action={dispatch} className="max-w-md mx-auto bg-white p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register</h1>
        
        <label htmlFor="username" className="block text-sm font-medium text-gray-800 mb-2">Username</label>
        <input type="text" id="username" name="username" className="w-full p-2 border border-gray-400 mb-4 bg-gray-100 text-gray-800" />

        <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-2">Password</label>
        <input type="password" id="password" name="password" className="w-full p-2 border border-gray-400 mb-4 bg-gray-100 text-gray-800" />

        <button type="submit" className="w-full bg-gray-800 text-white p-2 hover:bg-gray-600 mb-4">Create an Account</button>
        <Link href={search.get("redirect") === "oauth2" ? `/login?redirect=${params.redirect}&redirect_uri=${params.redirect_uri}&client_id=${params.client_id}&response_type=${params.response_type}&state=${params.state}` : "/login"} className="block text-center w-full bg-gray-200 text-gray-800 p-2 hover:bg-gray-300">Login</Link>
      </form>
      {result && (
        <div className="max-w-md mx-auto mt-4">
          <p className="text-center text-red-600">{result.message}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <Register />
    </Suspense>
  );
}