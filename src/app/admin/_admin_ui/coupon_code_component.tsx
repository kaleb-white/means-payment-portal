import { CouponCode } from "@/lib/database/schemas";
import clsx from "clsx";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

export default function CouponCodeComponent({
    couponCode,
    couponCodeSetter,
    resetInitialCode
}: {
    couponCode: CouponCode,
    couponCodeSetter: Dispatch<SetStateAction<CouponCode>>,
    resetInitialCode: boolean

}) {
    const [couponCodeInitial, setCouponCodeInitial] = useState(couponCode)
    useEffect(() => {
        if (!resetInitialCode) return
        setCouponCodeInitial(couponCode)
    }, [couponCode])
    return (
        <div className="means-border-bottom flex flex-row justify-between gap-2 p-1 md:p-2 overflow-x-scroll no-scrollbar">
            <div>{couponCode.email}</div>
            <input
                type={"text"}
                className={clsx("means-input", {"means-border-red": couponCode.couponCode !== couponCodeInitial.couponCode})}
                value={couponCode.couponCode}
                onChange={(e) => couponCodeSetter(prev => {return {email: prev.email, couponCode: e.target.value}})}
            />
        </div>
    )
}
