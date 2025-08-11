'use client'

import CustomError from "@/app/_client_ui/error";
import { Spinner } from "@/app/_client_ui/spinner";
import { QuarterlyReport, Range } from "@/lib/database/schemas";
import clsx from "clsx";
import { startTransition, use, useActionState, useEffect, useState } from "react";
import Controls from "@/app/_client_ui/pagination_controls";
import { Quarter } from "./quarter";
import Button from "@/app/_client_ui/button";
import Image from 'next/image';
import useRemoveError from "@/app/_custom_hooks/use_remove_error";
import Modal from "@/app/_client_ui/modal";

export default function PaginatedReports ({
    initialReports,
    numReports,
    REPORTSPERPAGE=5
}: {
    initialReports: Promise<QuarterlyReport[] | Error>,
    numReports: Promise<number | Error>,
    REPORTSPERPAGE?: number
}) {
    // Pagination controls
    const [pageNumber, setPageNumber] = useState(1)

    // Reports
    let reportsLength = use(numReports)
    let initReports = use(initialReports)
    const [reports, setReports] = useState(initReports)
    const [rangesFetched, setRangesFetched] = useState<number[]>(
        !(initReports instanceof Error)?
            // Calling python / php 'range' function on the math.floor calculation, essentially
            [...Array(
                Math.floor(
                    (initReports as QuarterlyReport[]).length / REPORTSPERPAGE)
                ) // Call array constructor on floor of number of reports, which returns an array with n empty spots
                .keys() // Get the keys, which are the indices
            ].map(pn => pn + 1) // Increase the keys by 1, since the indices start at 0 but page numbers start at 1
            : [1]
    ) // Not used for rendering, ref would work here too

    // Fetch new reports
    const [error, setError] = useState<string | null>(null)
    useRemoveError(error, setError)
    const [_, action, pending] = useActionState(
        async () => {
            // Reports are already fetched for this range
            if (rangesFetched.includes(pageNumber)) {setError(null); return}

            // Fetch the reports
            const range: Range = {
                start: (pageNumber - 1) * REPORTSPERPAGE,
                stop: (pageNumber * REPORTSPERPAGE) - 1
            }
            const response = await fetch('api/analytics/get-quarterly-reports-range', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(range)
            })

            // Handle an error; display to user
            if (response.status !== 200) {
                setError(response.statusText)
                return
            }

            const responseData = await response.json() as QuarterlyReport[]

            // Since data was succesfully fetched, add page number to list of pages we have
            setRangesFetched(prev => [...prev, pageNumber])

            // Resize reports array if necessary
            const curr = reports as QuarterlyReport[]
            const reportsExtended = curr.concat(new Array(Math.max(0, pageNumber * REPORTSPERPAGE - curr.length)))

            // Slice sections
            const before = reportsExtended.slice(0, (pageNumber - 1) * REPORTSPERPAGE)
            const after = reportsExtended.slice(pageNumber * REPORTSPERPAGE)

            // Set reports
            setReports(
                before.concat(responseData).concat(after)
            )
        },
        null
    )

    // On page change, update reports
    useEffect(() => {
        async function transitionReportData() {startTransition(action)}
        transitionReportData()
    }, [pageNumber])

    // Modal
    const [modalOpen, setModalOpen] = useState(false)

    // Delete reports
    const [reportToDelete, setReportToDelete] = useState<QuarterlyReport | null>(null)
    const [__, deleteReport, deletePending] = useActionState(async () => {
        if (!reportToDelete) {setError("Delete action called with no report defined"); return}
        const response = await fetch('api/analytics/delete-quarterly-report', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({year: String(reportToDelete.year), quarter: String(reportToDelete.quarter)})

        })

        // Handle an error; display to user
        if (response.status !== 200) {
            setError(response.statusText)
            return
        }

        // Remove quarter on success
        setReports(reports => {
            if (reports instanceof Error) return reports
            return (reports as QuarterlyReport[])
                .filter(r =>
                    !(r.quarter === reportToDelete?.quarter
                    && r.year === reportToDelete.year))
        })

        // Reset reportToDelete
        setReportToDelete(null)
    }, null)


    if (reports instanceof Error || reportsLength instanceof Error) {
        return (
            <div className="flex flex-col means-border">
                <CustomError text={(reports as Error).message} hidden={!(reports instanceof Error)} />
                <CustomError text={(reportsLength as Error).message} hidden={!(reportsLength instanceof Error)} />
            </div>
        )
    }
    return (
        <div className="flex flex-col means-border w-full">
            {/* Delete confirmation modal */}
            <Modal isOpen={modalOpen} setIsOpen={setModalOpen}>
                <div className="flex flex-col text-sm md:text-lg">
                    <div>Are you sure you want to delete this report?</div>
                    <div className="flex flex-row mt-1 md:mt-2 gap-2">
                    <Button text={"Yes"} onClick={() => {setModalOpen(false); startTransition(deleteReport)}}/>
                    <Button text={"No"} onClick={() => setModalOpen(false)} />
                    </div>
                </div>
            </Modal>

            {/* Reports */}
            <div className="flex flex-col md:relative">

                    {(reports as QuarterlyReport[])
                        .slice((pageNumber - 1) * REPORTSPERPAGE, pageNumber * REPORTSPERPAGE)
                        .map((r, i) => {return (

                            <div className="flex flex-row gap-0" key={i}>
                                {/* Delete button */}
                                <div className="means-border-bottom flex flex-col gap-1 justify-center items-center p-0.5 md:p-1">
                                    <Button
                                        onClick={() => {setReportToDelete(r); setModalOpen(true)}}
                                        text={<Image src="/trash.svg" alt="Delete Report" width={24} height={24}/>}
                                        styles={"h-fit mx-auto means-border hover:bg-means-bg-hover cursor-pointer"}
                                    />
                                </div>
                                {/* Quarter */}
                                <div className={clsx("relative md:static hover:bg-means-bg-hover cursor-pointer", `z-${i}`)}>
                                    <Quarter quarter={r}/>
                                </div>
                            </div>

                        )})
                    }
            </div>
            {/* Controls */}
            <Controls currentPage={pageNumber} pageSetter={setPageNumber} numPages={Math.ceil((reportsLength as number) / REPORTSPERPAGE)} />
            {/* Error */}
            <CustomError text={error? error: ''} hidden={error? false: true} />
            {/* Spinner */}
            <div className="flex flex-col items-center">
                {pending || deletePending? <Spinner /> : <></>}
            </div>
        </div>
    )
}
