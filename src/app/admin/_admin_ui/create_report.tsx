'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from "react"
import DropZone from "./drop_zone"
import { Check, Spinner } from "@/app/_client_ui/spinner"
import { fileTypes } from "@/configs"
import { parseCsvAsQuarterlyReport } from "@/app/_client_utilities/parse_csv"
import { isError } from "@/app/_client_utilities/type_checks"
import clsx from "clsx"
import { QuarterlyReport } from "@/lib/database/schemas"
import MultiError from "@/app/_client_ui/multi_error"
import { Quarter } from "./quarter"
import getItemSetter from "@/app/_client_utilities/get_item_setter"
import Button from "@/app/_client_ui/button"

export function CreateReport() {
    // unproccesedFiles: haven't checked for duplicate data, parsed files, etc
    // csvFiles: processed files that are checked for duplication, etc
    const [unprocessedFiles, setUnprocessedFiles] = useState<Array<File>>([])
    const [newReports, setNewReports] = useState<Array<QuarterlyReport>>([])

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
            const res = await parseCsvAsQuarterlyReport(file)
            if (isError(res)) {setErrors(prev => [...prev, new Error(res.message)]); return}
            setNewReports(prev => [...prev, res])
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
            // Post each report to the api
            for (const report of newReports) {
                const response = await fetch('api/analytics/create-quarterly-report', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(report)
                })

                if (response.status === 500) {setErrors(prev => [...prev, new Error("An internal server error occured, my bad")]); return}
                if (response.status !== 200) setErrors(prev => [...prev, new Error(response.statusText)])
                responses.push(response.status)
            }

            // Set success
            setSuccess(responses.every(status => status === 200))

            // Reset reports
            setNewReports([])
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
                    className="flex flex-row cursor-pointer text-center text-means-grey hover:text-means-grey-hover"
                    onChange={(e) => {e.preventDefault(); startTransition(action)}}
                />
            </div>

            {/* Errors */}
            <MultiError errors={errors} setErrors={setErrors} />

            {/* Reports */}
            {newReports.map((quarter, i) => { return (
                <Quarter quarter={quarter} key={i} noPost={true} persistState={getItemSetter<QuarterlyReport>(setNewReports, i)}/>
            )})}

            {/* Controls */}
            <div className={clsx("flex flex-row place-content-center w-full p-1 md:p-2 gap-1 md:gap-2", {'means-border-top': errors.length > 0})}>
                {savePending? <Spinner /> : <></>}
                <Check success={success}/>
                <Button text="Save Changes" onClick={() => startTransition(saveAction)} disabled={savePending} styles="w-full text-center" />
                <Button text="Reset" onClick={() => setNewReports([])} />
            </div>
        </div>
    )
}
