import { Spinner } from "@/app/_client_ui/spinner"
import Error from "@/app/_client_ui/error"
import clsx from "clsx"
import { SetStateAction, Dispatch, DragEvent, useState, useActionState, startTransition } from "react"
import useRemoveError from "@/app/_custom_hooks/use_remove_error"
import { fileTypes } from "@/configs"

export default function DropZone({
    setNewFiles
}: {
    setNewFiles:Dispatch<SetStateAction<File[]>>
}) {
    // Handle errors
    const [error, setError] = useState<string | null>(null)
    useRemoveError(error, setError)

    // Visual recognition of drop
    const [isOver, setIsOver] = useState(false)

    // Drag and Drop API callbacks
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsOver(true)
    }

    const handleDragOut = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsOver(false)
    }

    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
    const [dragEvent, setDragEvent] = useState<DragEvent<HTMLDivElement> | null>(null)
    const handleDrop = () => {
        // Should never happen but good to check
        if (!dragEvent) {setError("Drop event callback called without a DragEvent"); return}

        // Show there's no file hovering anymore
        setIsOver(false)

        // Handle file
        const newFiles: Array<File> = []
        if (dragEvent.dataTransfer.items) {
            [...dragEvent.dataTransfer.items].forEach((item) => {
                if (item.kind === "file") {
                    const asFile = item.getAsFile()
                    if (!asFile) { setError("An item was uploaded that wasn't a file"); return }

                    if (!fileTypes.csvs.includes(asFile?.type)) { setError("Please upload a csv. If you are uplaoding a csv and this message appears, contact the system admin."); return}

                    if (asFile) newFiles.push(asFile)
                } else { setError("An item was uploaded that wasn't a file"); return }
            })
        } else {
            setError("No files found!"); return
        }
        setNewFiles(prev => [...prev, ...newFiles])
    }
    const [_, action, pending] = useActionState(() => {
        handleDrop()
    }, null)


    return (
        <div className={clsx("flex flex-row text-xs text-center p-1", {'means-border-bottom-red': isOver, 'means-border-bottom': !isOver})}
            onDragOver={(e) => handleDragOver(e)}
            onDragLeave={(e) => handleDragOut(e)}
            onDrop={(e) => {e.preventDefault(); setDragEvent(e); startTransition(action)}}
        >
            {pending? <Spinner />: <></>}
            {error?
                <Error text={error} hidden={error? false: true} textsize="xs"/> :
                <div>
                    Drag your csv here or click below to upload a new csv!
                </div>
            }
        </div>
    )
}
