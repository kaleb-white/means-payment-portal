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
import Button from "@/app/_client_ui/button"
import Image from 'next/image'
import OptionsModal from "@/app/_client_ui/options_modal"
import { Spinner } from "@/app/_client_ui/spinner"
import clsx from "clsx"

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
        setCouponCodesInitial(structuredClone(newCouponCodes))
        setCouponCodes(newCouponCodes)

    }, null)

    // Delete controls
    const [modalOpen, setModalOpen] = useState(false)
    const [couponCodeToDelete, setCouponCodeToDelete] = useState<CouponCode | null>(null)
    const [__, deleteCouponCode, deletePending] = useActionState(async () => {
        if (!couponCodeToDelete) {setErrors(prev => [...prev, new Error("Delete action called with no coupon code defined")]); return}
        const response = await fetch(apiRoutes.deleteCouponCode, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(couponCodeToDelete)
        })

        // Handle an error; display to user
        if (response.status !== 200) {
            setErrors(prev => [...prev, new Error(response.statusText)])
            return
        }

        // Remove coupon code on success
        setCouponCodes(couponCodes => {
            return couponCodes.filter(c => !(c.email === couponCodeToDelete.email && c.couponCode === couponCodeToDelete.couponCode))
        })

        // Set initial
        setCouponCodesInitial(couponCodes => {
            return couponCodes.filter(c => !(c.email === couponCodeToDelete.email && c.couponCode === couponCodeToDelete.couponCode))
        })

        // Reset couponCodeToDelete
        setCouponCodeToDelete(null)
    }, null)

    // Pagination controls
    const [numPages, setNumPages] = useState(Math.ceil(couponCodes.length / REPORTSPERPAGE))
    const [pageNumber, setPageNumber] = useState(1)
    useEffect(() => {
        setNumPages(
            Math.ceil(couponCodes.filter(c => c.email.toLowerCase().includes(filter.toLowerCase())).length / REPORTSPERPAGE)
        )
    }, [REPORTSPERPAGE, filter, couponCodes])

    if (couponCodesPromise instanceof Error) {
        return (
            <div className="flex flex-col means-border">
                <CustomError.default text={(couponCodesPromise as Error).message} hidden={!(couponCodesPromise instanceof Error)} />
            </div>
        )
    }
    return (
        <div className="flex flex-col means-border w-full text-xs md:text-sm">
            <OptionsModal
                isOpen={modalOpen}
                setIsOpen={setModalOpen}
                optionText="Are you sure you want to delete this coupon code?"
                buttons={[
                    {text: 'Yes', callback: () => {setModalOpen(false); startTransition(deleteCouponCode)}},
                    {text: 'No', callback: () => setModalOpen(false)}
                ]}
            />

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
                        <div className="flex flex-row gap-0 items-center" key={i}>
                            <div className={clsx("shrink-0 flex flex-col gap-1 justify-center items-center p-0.5 md:p-1 h-full", {
                                'means-border-bottom': !couponCodesInitial.every(c => !(c.couponCode === coupon.couponCode && c.email === coupon.email)),
                                'means-border-bottom-red': couponCodesInitial.every(c => !(c.couponCode === coupon.couponCode && c.email === coupon.email))
                            })}>
                                <Button
                                    onClick={() => {setCouponCodeToDelete(coupon); setModalOpen(true)}}
                                    text={<Image src="/trash.svg" alt="Delete Report" width={24} height={24}/>}
                                    styles={"h-fit mx-auto means-border hover:bg-means-bg-hover cursor-pointer"}
                                />
                            </div>
                            <div className="overflow-scroll no-scrollbar h-full">
                                <CouponCodeComponent
                                    couponCode={coupon}
                                    couponCodeSetter={getItemSetter(setCouponCodes, i)}
                                />
                            </div>
                        </div>
                    )})
                    .slice((pageNumber - 1) * REPORTSPERPAGE, pageNumber * REPORTSPERPAGE)
                }
                <Controls currentPage={pageNumber} pageSetter={setPageNumber} numPages={numPages} />
                <MultiError errors={errors} setErrors={setErrors}/>
                {deletePending? <div className="flex place-content-center means-border-top"><Spinner /></div> : <></>}
            </CouponCodesContext>
        </div>
    )
}
