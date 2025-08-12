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
        setExists(!initial.every(c => !(c.couponCode === couponCode.couponCode && c.email === couponCode.email)))
    }, [initial, couponCode])
    return (
        <div className={clsx("h-full flex flex-row items-center justify-between gap-2 p-1 md:p-2 overflow-x-scroll no-scrollbar", {"means-border-bottom-red": !exists, "means-border-bottom": exists})}>
            <div>{couponCode.email}</div>
            <input
                type={"text"}
                className="means-input"
                placeholder="Coupon Code..."
                value={couponCode.couponCode}
                onChange={(e) => couponCodeSetter(prev => {return {email: prev.email, couponCode: e.target.value}})}
            />
        </div>
    )
}

export function CouponCodeEmailEditable({
    couponCode,
    couponCodeSetter
}: {
    couponCode: CouponCode,
    couponCodeSetter: Dispatch<SetStateAction<CouponCode>>,

}) {
    const initial = useContext(CouponCodesContext)
    const [exists, setExists] = useState(false)
    useEffect(() => {
        setExists(!initial.every(c => !(c.couponCode === couponCode.couponCode && c.email === couponCode.email)))
    }, [initial, couponCode])
    return (
        <div className={clsx("h-full flex flex-row items-center justify-between gap-2 p-1 md:p-2 overflow-x-scroll no-scrollbar", {"means-border-bottom-red": !exists, "means-border-bottom": exists})}>
            <input
                type={"text"}
                className="means-input min-w-0"
                placeholder="Email..."
                value={couponCode.email}
                onChange={(e) => couponCodeSetter(prev => {return {email: e.target.value, couponCode: prev.couponCode}})}
            />
            <input
                type={"text"}
                className="means-input min-w-0"
                placeholder="Coupon Code..."
                value={couponCode.couponCode}
                onChange={(e) => couponCodeSetter(prev => {return {email: prev.email, couponCode: e.target.value}})}
            />
        </div>
    )
}
