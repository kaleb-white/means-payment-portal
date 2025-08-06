import { Dispatch, SetStateAction } from "react";

export default function getItemSetter<T>(
    setArray: Dispatch<SetStateAction<T[]>>,
    index: number
): Dispatch<SetStateAction<T>> {
    return (valueOrUpdate: SetStateAction<T>) => {
        setArray(prev => {
            const newArray = [...prev]
            const newValue = typeof valueOrUpdate === 'function'?
                (valueOrUpdate as (prev: T) => T)(newArray[index]) :
                valueOrUpdate
            newArray[index] = newValue
            return newArray
        })
    }
}
