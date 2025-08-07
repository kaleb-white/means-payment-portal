import { Dispatch, SetStateAction, useRef } from "react";
import useControlOpen from "../_custom_hooks/use_control_open";


// Reference: https://tailwindcss.com/plus/ui-blocks/application-ui/overlays/modal-dialogs
export default function Modal({
    isOpen,
    setIsOpen,
    children=<></>
}: {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    children?: React.ReactNode
}) {
    const parent = useRef(null)
    const child = useRef(null)
    useControlOpen({parentRef: parent, childRef: child, state: isOpen, setState: setIsOpen})

    if (!isOpen) return  <></>
    return (
        <>
            <div className="fixed inset-0 bg-means-grey/50" ref={parent}>
            </div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end sm:items-center justify-center">
                    <div className="flex flex-col means-border bg-black w-fit h-fit p-2 md:p-4" ref={child}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}
