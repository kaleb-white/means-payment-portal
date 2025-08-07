import { Dispatch, SetStateAction } from "react";
import Error from "@/app/_client_ui/error";
import Button from "@/app/_client_ui/button";
import { Spinner, Check } from "@/app/_client_ui/spinner";

export default function EditorControls({
    noSave,
    savePending,
    unsavedChanges,
    onSave,
    onResetChanges,
    filter,
    filterPlaceholder,
    setFilter,
    error
}:{
    noSave: boolean,
    savePending: boolean,
    unsavedChanges: boolean,
    onSave: Function,
    onResetChanges: Function,
    filter: string,
    filterPlaceholder: string,
    setFilter: Dispatch<SetStateAction<string>>,
    error: string | null
}) {
    return (
        <div className="flex flex-col text-xs md:text-sm p-1 md:p-2 gap-1 md:gap-2 means-border-bottom cursor-auto">
            <div className="flex flex-row gap-1 md:gap-2">
                {noSave? <></> : <>
                    {savePending? <Spinner />: <></>}
                    <Check show={savePending !== null && !savePending}/>
                    <Button onClick={() => onSave()} text="Save Changes" styles={{'means-border hover:bg-means-bg-hover': !unsavedChanges, "border-0 rounded-none bg-means-red hover:bg-means-red-hover": unsavedChanges}} />
                </>}
                <Button onClick={() => onResetChanges()} text="Reset Changes" />
                <input className="means-input px-0" placeholder={filterPlaceholder} value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <Error text={error? error : ''} hidden={error? false : true} />
        </div>
    )
}
