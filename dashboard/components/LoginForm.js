"use client";
import { useFormState } from 'react-dom';

export default function LoginForm(onSubmit) {
  const [result, dispatch] = useFormState(postAction, {});
    return (
        <div className="border p-4">
            <form onSubmit={onSubmit}>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}