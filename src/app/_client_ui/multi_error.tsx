import { Dispatch, SetStateAction, useEffect } from "react";
import Error from "./error";
import { timers } from "@/configs";

export default function MultiError({
    errors,
    setErrors,
    textsize='sm'
}: {
    errors: Array<Error>,
    setErrors: Dispatch<SetStateAction<Array<Error>>>,
    textsize?: string
}) {

    useEffect(() => {
        errors.forEach((err, i) => {
            setTimeout(() => {
                setErrors(prev => prev.filter(matchingErr => matchingErr !== err))
            }, timers.errorTimeout + i * timers.nextErrorTimeout)
        })
    }, [errors])


    return (
        <>
        {errors.length > 0 ?
            <div className="flex flex-col max-h-20 overflow-y-scroll">
                {errors.map((error, i) => { return (
                    <Error text={error.message} hidden={false} textsize={textsize} key={i}/>
                )})}
            </div>:
            <></>
        }
        </>
    )
}
