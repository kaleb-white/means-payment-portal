import { Dispatch, SetStateAction } from "react";
import Modal from "./modal";
import Button from "./button";

export default function OptionsModal({
    isOpen,
    setIsOpen,
    optionText,
    buttons
}: {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    optionText: string,
    buttons: Array<{text: string, callback: () => void}>
}) {
    return (
        <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="flex flex-col text-sm md:text-lg">
                <div>{optionText}</div>
                <div className="flex flex-row mt-1 md:mt-2 gap-2">
                    {buttons.map((opt, i) =>
                        <Button key={i} text={opt.text} onClick={opt.callback} />
                    )}
                </div>
            </div>
        </Modal>
    )
}
