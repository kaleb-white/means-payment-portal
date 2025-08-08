import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import useControlOpen from "../_custom_hooks/use_control_open";
import clsx from "clsx";
import useTransform from "../_custom_hooks/use_transform";


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
    const child = useRef<HTMLDivElement | null>(null)
    useControlOpen({parentRef: parent, childRef: child, state: isOpen, setState: setIsOpen})

    useTransform({ eltRef:child, needsTransformed: isOpen, initial:["scale-100"], afterTransform:["scale-110"]})

    return (
        <div className={clsx({hidden: !isOpen})}>
            <div className="fixed inset-0 bg-means-grey/50" ref={parent}>
            </div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end sm:items-center justify-center">
                    <div className={clsx("flex flex-col means-border bg-black w-fit h-fit p-2 md:p-4 transform duration-100 ease-linear shadow-2xl")} ref={child}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
