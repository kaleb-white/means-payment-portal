import clsx from "clsx"
import { MouseEventHandler } from "react"

export default function Button({
    text,
    onClick,
    disabled=false,
    styles=""
}: {
    text: string,
    onClick: MouseEventHandler,
    disabled?: boolean,
    styles?: string | {[key: string]: boolean}
}) { return (
    <div
        onClick={onClick}
        className={clsx("means-border p-0.5 md:p-1",
            {
                "hover:bg-means-bg-hover cursor-pointer text-white": !disabled,
                "cursor-auto text-means-grey": disabled
            },
            styles
        )}
    >
        {text}
    </div>
)}
