import clsx from "clsx";
import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * A spinner with a red border.
 */
export function Spinner() {
    return  (
        <div className="flex items-center">
            <div className={clsx(`animate-spin border-means-red rounded-full border-4 border-t-transparent bg-transparent min-w-[20px] min-h-[20px] m-1`)}>
            </div>
        </div>
    )
}

/**
 * A green checkmark.
 * @param pending The boolean indicating a pending action.
 */
export function Check({ success }:{ success: boolean }) {
    const [isShowing, setIsShowing] = useState(false)
    useEffect(() => {
        if (!success) return
        setIsShowing(true)
        setTimeout(() => setIsShowing(false), 1000)
    }, [success])
    return (
        <div className={clsx("items-center animate-pulse", {'hidden': !isShowing, 'flex': isShowing})}>
            <div dangerouslySetInnerHTML={{__html: "<!-- credit to https://www.onlinewebfonts.com/icon/576697 -->"}} />
            <div className="min-w-[20px] min-h-[20px] max-h-[20px] max-w-[20px]">
                <Image alt="checkmark" height={256} width={256} src="/checkmark.svg" />
            </div>
        </div>
    )
}
