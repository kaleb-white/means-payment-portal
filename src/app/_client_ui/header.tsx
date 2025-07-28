import clsx from "clsx";

export default function Header({ text, underlined = true }: { text: string, underlined?: boolean }) {
    return (
        <p className={clsx("text-white text-l md:text-2xl transtion-[text-decoration-line] duration-700",
            {
                'means-underline': underlined,
                'no-underline': !underlined
            }
        )}>
            {text}
        </p>
    )
}
