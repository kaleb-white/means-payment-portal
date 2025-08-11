'use client'
import Controls from "@/app/_client_ui/pagination_controls"
import CouponCodeComponent from "./coupon_code_component"
import getItemSetter from "@/app/_client_utilities/get_item_setter"
import * as CustomError from "@/app/_client_ui/error"
import { CouponCode } from "@/lib/database/schemas"
import { useEffect, useState, use, useActionState, startTransition, createContext } from "react"
import { isEqual, difference } from 'lodash'
import EditorControls from "../editor_controls"
import { apiRoutes } from "@/configs"
import MultiError from "@/app/_client_ui/multi_error"

export const CouponCodesContext = createContext<CouponCode[]>([])

export default function PaginatedCouponCodes ({
    initialCouponCodes,
    REPORTSPERPAGE=5
}: {
    initialCouponCodes: Promise<CouponCode[] | Error>,
    REPORTSPERPAGE?: number
}) {
    // Coupon Codes
    let couponCodesPromise = use(initialCouponCodes)
    const [couponCodesInitial, setCouponCodesInitial] = useState(
        structuredClone(couponCodesPromise instanceof Error?
            []:
            (couponCodesPromise as CouponCode[]).sort((a, b) => a.email < b.email? -1 : 1)
        )
    )
    const [couponCodes, setCouponCodes] = useState(structuredClone(couponCodesInitial))


    // Editor controls
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    const [filter, setFilter] = useState("")
    const [errors, setErrors] = useState<Error[]>([])
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

        let newCouponCodes = couponCodesInitial
        // Selectively set errors or update coupon codes
        for (const i in responses) {
            if (responses[i].status !== 200) {
                setErrors(prev => [...prev, new Error(responses[i].statusText)])
            } else {
                try {
                    const resBody = (await responses[i].json()).data as CouponCode
                    newCouponCodes = [...newCouponCodes.filter(c => c.email !== resBody.email), resBody]
                } catch {
                    setErrors(prev => [...prev, new Error("Unexpected API return value; refresh page to see changes!")])
                }
            }
        }
        newCouponCodes.sort((a, b) => a.email < b.email? -1 : 1)


        // Check for success
        setSaveSuccess(false)
        setSaveSuccess(responses.every(res => res.status === 200))

        // Reset coupon codes
        setCouponCodesInitial(newCouponCodes)
        setCouponCodes(newCouponCodes)

    }, null)


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
                <CustomError.default text={(couponCodesPromise as Error).message} hidden={!(couponCodesPromise instanceof Error)} />
            </div>
        )
    }
    return (
        <div className="flex flex-col means-border w-full text-xs md:text-sm">
            <CouponCodesContext value={couponCodesInitial}>
                <EditorControls
                    noSave={false}
                    savePending={savePending}
                    saveSuccess={saveSuccess}
                    unsavedChanges={unsavedChanges}
                    onSave={() => startTransition(saveAction)}
                    onResetChanges={() => setCouponCodes(structuredClone(couponCodesInitial))}
                    filter={filter}
                    filterPlaceholder="Filter by email..."
                    setFilter={setFilter}
                />
                {couponCodes
                    .filter(c => c.email.toLowerCase().includes(filter.toLowerCase()))
                    .map((coupon, i) => {return (
                        <CouponCodeComponent
                            key={i}
                            couponCode={coupon}
                            couponCodeSetter={getItemSetter(setCouponCodes, i)}
                        />
                    )})
                    .slice((pageNumber - 1) * REPORTSPERPAGE, pageNumber * REPORTSPERPAGE)
                }
                <Controls currentPage={pageNumber} pageSetter={setPageNumber} numPages={numPages} />
                <MultiError errors={errors} setErrors={setErrors}/>
            </CouponCodesContext>
        </div>
    )
}
