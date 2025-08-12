'use client'

import { Dispatch, SetStateAction, startTransition, useActionState, useEffect, useRef, useState } from "react"
import DropZone from "./drop_zone"
import { Check, Spinner } from "@/app/_client_ui/spinner"
import { apiRoutes, fileTypes } from "@/configs"
import { isCouponCode, isError, isQuarterlyReport } from "@/app/_client_utilities/type_checks"
import clsx from "clsx"
import MultiError from "@/app/_client_ui/multi_error"
import getItemSetter from "@/app/_client_utilities/get_item_setter"
import Button from "@/app/_client_ui/button"
import { Quarter } from "./reports/quarter"
import { CouponCode, QuarterlyReport } from "@/lib/database/schemas"
import CustomError from "@/app/_client_ui/error"
import { CouponCodeEmailEditable } from "./coupon_codes/coupon_code_component"

/**
 *
 * @param fileParser
 * @param apiEndpoint
 * @param allowNew
 * @returns
 */
export function CreateObjsFromFile<T>({
    fileParser,
    apiEndpoint,
    allowNew=false
}: {
    fileParser: ((file: File) => Promise<T | Error>) | ((file: File) => Promise<T[] | Error>),
    apiEndpoint: apiRoutes,
    allowNew?: boolean
}) {
    // unproccesedFiles: haven't checked for duplicate data, parsed files, etc
    // csvFiles: processed files that are checked for duplication, etc
    const [unprocessedFiles, setUnprocessedFiles] = useState<Array<File>>([])
    const [newObjs, setNewObjs] = useState<Array<T>>([])

    // Errors
    const [errors, setErrors] = useState<Array<Error>>([])

    // Handle file upload from click
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [__, action, pending] = useActionState(() => {handleFileInput()}, null)
    const handleFileInput = () => {
        // Has to be called after hydration
        if (!inputRef.current) return

        // Not sure this is possible but handle anyway
        if (!inputRef.current.files) setErrors(prev => [...prev, new Error("No files were uploaded")])

        // Type cast and add to files needing processing
        const newFiles: Array<File> = []
        for (const file of inputRef.current.files as FileList) {
            newFiles.push(file)
        }
        setUnprocessedFiles(prev => [...prev, ...newFiles])
    }

    // Process uploads
    const [_, processCsv, csvsPending] = useActionState(async () => {
        // Check that all file types are csvs, stop on error
        let earlyExit = false
        unprocessedFiles.forEach((file) => {
            // Check that a csv is being uploaded
            if (!fileTypes.csvs.includes(file.type)) {
                setErrors(prev => [...prev, new Error("Please upload only csvs. If you are uploading a csv and this message appears, contact the system admin.")])
                earlyExit = true
            }
        })
        if (earlyExit) return

        // Process csv and error check
        unprocessedFiles.forEach(async file => {
            const res = await fileParser(file)
            if (isError(res)) {setErrors(prev => [...prev, new Error(res.message)]); return}
            Array.isArray(res) ?
                setNewObjs(prev => prev.concat(res)) :
                setNewObjs(prev => [...prev, res])
        })

        setUnprocessedFiles([])
    }, null)
    useEffect(() => {
        // Only run effect if there are files to process
        if (unprocessedFiles.length === 0) return
        startTransition(processCsv)
    }, [unprocessedFiles])

    // Handle save to db
    const [success, setSuccess] = useState(false)
    const [___, saveAction, savePending] = useActionState(
        async () => {
            const responses = []
            // Post each obj to the api
            for (const obj of newObjs) {
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                })

                if (response.status === 500) {setErrors(prev => [...prev, new Error("An internal server error occured, my bad")]); return}
                if (response.status !== 200) setErrors(prev => [...prev, new Error(response.statusText)])
                responses.push(response.status)
            }

            // Set success
            setSuccess(responses.every(status => status === 200))

            // Reset reports
            setNewObjs([])
        },
        null
    )

    return (
        <div className="flex flex-col justify-center means-border w-full relative text-sm md:text-base">
            {/* Drop zone */}
            <DropZone setNewFiles={setUnprocessedFiles}/>
            {csvsPending? <Spinner />: <></>}

            {/* Upload */}
            <div className="flex flex-row w-full p-1 means-border-bottom">
                {pending? <Spinner /> : <></>}
                <input
                    type="file" accept=".csv" multiple ref={inputRef}
                    className="block text-xs cursor-pointer text-center text-means-grey hover:text-means-grey-hover hover:bg-means-bg-hover overflow-scroll"
                    onChange={(e) => {e.preventDefault(); startTransition(action)}}
                />
            </div>

            {/* Errors */}
            <MultiError errors={errors} setErrors={setErrors} />

            {/* Objs */}
            {newObjs.length === 0 ? <></> :
            isQuarterlyReport(newObjs[0])?
                newObjs.map((quarter, i) => { return (
                    <Quarter quarter={quarter as QuarterlyReport} key={i} noPost={true} persistState={getItemSetter<QuarterlyReport>((setNewObjs as Dispatch<SetStateAction<QuarterlyReport[]>>), i)}/>
                )}) :
            isCouponCode(newObjs[0])?
                newObjs.map((couponCode, i) => { return (
                    <CouponCodeEmailEditable key={i} couponCode={couponCode as CouponCode} couponCodeSetter={getItemSetter<CouponCode>(setNewObjs as Dispatch<SetStateAction<CouponCode[]>>, i)}/>
                )}) :
                <CustomError text="Please call this component with only a recognized object type." hidden={false} />
            }

            {/* Manual Creator */}
            {!allowNew? <></> :
            isCouponCode(apiEndpoint)?
                <div className="means-border-bottom p-1 text-xs text-means-grey hover:text-means-grey-hover flex items-center bg-black hover:bg-means-bg-hover cursor-pointer"
                    onClick={() => {setNewObjs(prev => [...prev, {email: "", couponCode: ""} as T])}}
                >
                    Add manually...
                </div> :
                <CustomError text="AllowNew is currently only configured for couponCodes; please set allowNew to false or change generic type to CouponCodes." hidden={false} />
            }

            {/* Controls */}
            <div className={clsx("flex flex-row place-content-center w-full p-1 md:p-2 gap-1 md:gap-2", {'means-border-top': errors.length > 0})}>
                {savePending? <Spinner /> : <></>}
                <Check success={success}/>
                <Button text="Save Changes" onClick={() => startTransition(saveAction)} disabled={savePending} styles="w-full text-center" />
                <Button text="Reset" onClick={() => setNewObjs([])} />
            </div>
        </div>
    )
}
