import clsx from "clsx";

export default function CustomError({text, hidden, textsize='sm'}: {text: string, hidden: boolean, textsize?:string}) {
    return (
        <div className={clsx('w-full m-2 mx-auto text-center overflow-clip text-means-red-error',
            {'hidden': hidden},
            {'text-sm': textsize === 'sm', 'text-xs': textsize==='xs'},
        )}>
            {text}
        </div>
    )
}
