import clsx from "clsx"
import { MouseEventHandler } from "react"

/**
 * Default button component.
 * @param text Either text or a ReactNode.
 * @param onClick The function to run on click.
 * @param disable Optional, changes text color to grey. Does not rely on type of text.
 * @param styles Additional styles to add; is of type string | {[key: string]: boolean}. Adds styles before the default styles; however, sometimes does not end up overruling them.
 */
export default function Button({
    text,
    onClick,
    disabled=false,
    styles=""
}: {
    text: string | React.ReactNode,
    onClick: MouseEventHandler,
    disabled?: boolean,
    styles?: string | {[key: string]: boolean}
}) { return (
    <div
        onClick={onClick}
        className={clsx(styles,
            {
                "hover:bg-means-bg-hover cursor-pointer text-white": !disabled,
                "cursor-auto text-means-grey": disabled
            },
            "means-border p-0.5 md:p-1"
        )}
    >
        {text}
    </div>
)}
