import { Dispatch, RefObject, SetStateAction, useEffect } from "react"

export default function useControlOpen({
    parentRef,
    childRef,
    state,
    setState
}: {
    parentRef: RefObject<HTMLDivElement | null>,
    childRef: RefObject<HTMLDivElement | null>,
    state: Boolean,
    setState: Dispatch<SetStateAction<boolean>>
}): void {
    useEffect(() => {
        const callback = (ev: MouseEvent) => {
            const loc = ev.target as HTMLElement
            if (!state && parentRef.current?.contains(loc)) {
                setState(true)
                return
            }
            if (state && !childRef.current?.contains(loc)) {
                setState(false)
            }
        }
        document.addEventListener('click', callback)
        return () => document.removeEventListener('click', callback)
    }, [state])
}
