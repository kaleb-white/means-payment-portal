import clsx from "clsx";

export default function Header({ text, underlined=true, textSize="2xl" }: { text: string, underlined?: boolean, textSize?: string }) {
    return (
        <p className={clsx("text-white transtion-[text-decoration-line] duration-700",
            {
                'means-underline': underlined,
                'no-underline': !underlined
            },
            {
                'text-l md:text-2xl': textSize === "2xl",
                'text-base md:text-xl': textSize == "xl"
            }
        )}>
            {text}
        </p>
    )
}
