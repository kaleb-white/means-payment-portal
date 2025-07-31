import clsx from "clsx";

export default function Error({text, hidden}: {text: string, hidden: boolean}) {
    return (
        <div className={clsx('w-full mb-4 mx-auto text-center text-sm overflow-clip text-means-red-error', {'hidden': hidden})}>
            {text}
        </div>
    )
}
