import clsx from "clsx";

/**
 * A spinner with a red border and customizable size.
 * @param size The min-w and min-h of the spinner, in pixels. Defaults to 20.
 */
export function Spinner({size=20}: {size: number}) {
    return  (<div className="flex items-center">
                <div className={clsx(`animate-spin border-means-red rounded-full border-4 border-t-transparent bg-transparent
                    min-w-[${size}px] min-h-[${size}px]`)}>
                </div>
            </div>)
}
