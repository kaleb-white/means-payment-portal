import { RefObject, useEffect } from "react";

export default function useTransform({
    eltRef,
    needsTransformed,
    initial,
    afterTransform,
    transformAfterMs=10
}: {
    eltRef: RefObject<HTMLDivElement | null>,
    needsTransformed: boolean,
    initial: string[],
    afterTransform: string[],
    transformAfterMs?: number
}) {
    useEffect(() => {

        if (!eltRef.current) return
        if (!needsTransformed) {
            initial.forEach(cls => eltRef.current?.classList.add(cls))
            afterTransform.forEach(cls => eltRef.current?.classList.remove(cls))
        } else {
            initial.forEach(cls => eltRef.current?.classList.remove(cls))
            afterTransform.forEach(cls =>
                setTimeout(() => eltRef.current?.classList.add(cls), transformAfterMs))
        }
    }, [needsTransformed])

}
