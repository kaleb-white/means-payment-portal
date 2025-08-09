'use client'
import Controls from "@/app/_client_ui/pagination_controls"
import CouponCodeComponent from "./coupon_code_component"
import Error from "@/app/_client_ui/error"
import getItemSetter from "@/app/_client_utilities/get_item_setter"
import { CouponCode } from "@/lib/database/schemas"
import { useEffect, useState, use, useActionState, startTransition } from "react"
import { isEqual, difference } from 'lodash'
import EditorControls from "./editor_controls"
import { apiRoutes } from "@/configs"

export default function PaginatedCouponCodes ({
    initialCouponCodes,
    REPORTSPERPAGE=1
}: {
    initialCouponCodes: Promise<CouponCode[] | Error>,
    REPORTSPERPAGE?: number
}) {
    // Coupon Codes
    let couponCodesPromise = use(initialCouponCodes)
    const [couponCodesInitial, setCouponCodesInitial] = useState(
        structuredClone(couponCodesPromise instanceof Error?
            []:
            (couponCodesPromise as CouponCode[])
        )
    )
    const [couponCodes, setCouponCodes] = useState(structuredClone(couponCodesInitial))
    const [couponCodesNeedReset, setCouponCodesNeedReset] = useState(false)

    // Editor controls
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    useEffect(() => {setUnsavedChanges(!isEqual(couponCodes, couponCodesInitial))}, [couponCodes, couponCodesInitial])
    const [_, saveAction, savePending] = useActionState(async () => {
        // Get codes that need changed
        const differences = difference(couponCodes, couponCodesInitial)

        // Create promises based on difference between given and initial array
        const responsesAwaitable = differences.map(async (coupon) => {
            return fetch(apiRoutes.updateCouponCode, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(coupon)
            })
        })

        // Await all calls at the same time
        const responses = await Promise.all(responsesAwaitable)

        // Check for success
        setSaveSuccess(false)
        setSaveSuccess(responses.every(res => res.status === 200))

        // Selectively set errors or update coupon codes
        const newCouponCodes = couponCodesInitial
        for (const i in responses) {
            if (responses[i].status !== 200) {
                // do set error
            } else {
                newCouponCodes
            }
        }

        // Reset coupon codes
        setCouponCodesNeedReset(true)
        setCouponCodesInitial(newCouponCodes)
        setCouponCodesNeedReset(false)


    }, null)
    const [filter, setFilter] = useState("")
    const [editorError, setEditorError] = useState<string | null>(null)


    // Pagination controls
    const [numPages, setNumPages] = useState(Math.ceil(couponCodes.length / REPORTSPERPAGE))
    const [pageNumber, setPageNumber] = useState(1)
    useEffect(() => {
        setNumPages(
            Math.ceil(couponCodes.filter(c => c.email.toLowerCase().includes(filter.toLowerCase())).length / REPORTSPERPAGE)
        )
    }, [REPORTSPERPAGE, filter])

    if (couponCodesPromise instanceof Error) {
        return (
            <div className="flex flex-col means-border">
                <Error text={(couponCodesPromise as Error).message} hidden={!(couponCodesPromise instanceof Error)} />
            </div>
        )
    }
    return (
        <div className="flex flex-col means-border w-full text-xs md:text-sm">
            <EditorControls
                noSave={false} // for right now
                savePending={savePending}
                saveSuccess={saveSuccess}
                unsavedChanges={unsavedChanges}
                onSave={() => startTransition(saveAction)}
                onResetChanges={() => setCouponCodes(structuredClone(couponCodesInitial))}
                filter={filter}
                filterPlaceholder="Filter by email..."
                setFilter={setFilter}
                error={editorError}
            />
            {couponCodes
                .filter(c => c.email.toLowerCase().includes(filter.toLowerCase()))
                .map((coupon, i) => {return (
                    <CouponCodeComponent
                        key={i}
                        couponCode={coupon}
                        couponCodeSetter={getItemSetter(setCouponCodes, i)}
                        resetInitialCode={couponCodesNeedReset}
                    />
                )})
                .slice((pageNumber - 1) * REPORTSPERPAGE, pageNumber * REPORTSPERPAGE)
            }
            <Controls currentPage={pageNumber} pageSetter={setPageNumber} numPages={numPages} />
        </div>
    )
}
