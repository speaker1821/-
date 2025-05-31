"use client";
import { useFormState } from "react-dom";
import addFavoriteToBackend from "./addFavoriteToBackend";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function NewFavorite({token}) {
    const inputRef = useRef(null);
    const [note, setNote] = useState(null);
    const [color, setColor] = useState(null);
    const [result, dispatch] = useFormState(handleSubmit, null);
    function handleSubmit(e) {
        e.preventDefault();
        const url = inputRef.current.value;
        
        addFavoriteToBackend(url, token).then((res) => {
        const ret = res;
        
        if (ret.status === "success") {
            setColor("blue");
            inputRef.current.value = "";
        } else {
            setColor("red");
        }
        return setNote(ret.message);
        })
    }
    
    return (
        <div className="p-4">
            <form className="flex space-x-4">
                <input
                    type="url"
                    id="url"
                    name="url"
                    ref={inputRef}
                    className="flex-grow p-2 border border-gray-300 rounded-md"
                    placeholder="Enter URL"
                    required
                />
                <button type="submit" onClick={handleSubmit} className="bg-gray-800 text-white p-2 rounded hover:bg-gray-600">Add</button>
            </form>
            {note && (
            <p className={`text-${color}-600`}>{note}</p>
            )}
        </div>
    );
}