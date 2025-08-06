import clsx from "clsx"
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react"

export default function Controls({
    currentPage,
    pageSetter,
    numPages
}: {
    currentPage: number,
    pageSetter: Dispatch<SetStateAction<number>>,
    numPages: number
}) {
    let next2, next, prev, prev2

    // Other choices to render dynamically
    const [to1, setTo1] = useState(false)
    const [toMax, setToMax] = useState(false)
    const [controlArr, setControlArray] = useState(new Array<number | null>)

    // Set values
    useEffect(() => {
        if (currentPage > numPages) pageSetter(numPages)

        setToMax(currentPage + 3 >= numPages ? false : true)
        next2 = currentPage + 1 >= numPages ? null : currentPage + 2
        next = currentPage >= numPages ? null : currentPage + 1
        prev = currentPage <= 1 ? null : currentPage - 1
        prev2 = currentPage - 1 <= 1 ? null : currentPage - 2
        setTo1(currentPage - 3 <= 1? false : true)

        setControlArray([prev2, prev, currentPage, next, next2])
    }, [currentPage, numPages])
    function renderIfNotNull(bool:boolean, component: ReactNode) {if (bool) return component}
    return (
        <div className="flex flex-row justify-between gap-1 m-1 md:m-2 rounded-b-1 text-xs md:text-sm text-means-grey ">
            {/* Back One */}
            <div className="hover:text-means-grey-hover cursor-pointer" onClick={() => {pageSetter(Math.max(0, currentPage - 1))}}>◁</div>
            {/* Go to Start */}
            {renderIfNotNull(
                to1,
                (<><div className="hover:text-means-grey-hover cursor-pointer" onClick={() => {pageSetter(1)}}>1
                </div><div>...</div></>)
            )}
            {/* Pages Before and Afer */}
            {controlArr.map((num, i) => {
                if (!num) return null
                return (
                    <div
                        className={clsx("hover:text-means-grey-hover cursor-pointer", {"text-means-red": num === currentPage})}
                        onClick={() => {pageSetter(num)}}
                        key={i}>
                        {num}
                    </div>
                )
            })}
            {/* Go to End */}
            {renderIfNotNull(
                toMax,
                (<><div>...</div><div className="hover:text-means-grey-hover cursor-pointer" onClick={() => {pageSetter(numPages)}}>{numPages}
                </div></>)
            )}
            {/* Forward One */}
            <div className="hover:text-means-grey-hover cursor-pointer" onClick={() => {pageSetter(Math.min(numPages, currentPage + 1))}}>▷</div>
        </div>
    )
}
