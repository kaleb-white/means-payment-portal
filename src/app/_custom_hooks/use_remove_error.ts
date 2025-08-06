import { timers } from "@/configs";
import { Dispatch, SetStateAction, useEffect } from "react";

export default function useRemoveError(error: string | null, setError: Dispatch<SetStateAction<string | null>>) {
    useEffect(() => {
        setTimeout(() => {setError(null)}, timers.errorTimeout)
    }, [error])
}
