import { CouponCode } from "@/lib/database/schemas";
import clsx from "clsx";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { CouponCodesContext } from "./paginated_coupon_codes";

export default function CouponCodeComponent({
    couponCode,
    couponCodeSetter
}: {
    couponCode: CouponCode,
    couponCodeSetter: Dispatch<SetStateAction<CouponCode>>,

}) {
    const initial = useContext(CouponCodesContext)
    const [exists, setExists] = useState(false)
    useEffect(() => {
        let found = false
        initial.forEach(c => {
            if (c.couponCode === couponCode.couponCode && c.email === couponCode.email) {
                found = true
            }
        })
        setExists(found)

    }, [initial, couponCode])
    return (
        <div className={clsx("flex flex-row justify-between gap-2 p-1 md:p-2 overflow-x-scroll no-scrollbar", {"means-border-bottom-red": !exists, "means-border-bottom": exists})}>
            <div>{couponCode.email}</div>
            <input
                type={"text"}
                className="means-input"
                value={couponCode.couponCode}
                onChange={(e) => couponCodeSetter(prev => {return {email: prev.email, couponCode: e.target.value}})}
            />
        </div>
    )
}
