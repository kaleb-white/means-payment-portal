'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { baseUrls } from '@/configs'
import { signOutSubmit } from '@/lib/services/login'
import { startTransition, useActionState } from 'react'
import { Spinner } from './spinner'

export default function Navbar({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname()

    const [_, signOutAction, signOutPending] = useActionState(signOutSubmit, null)

    return (
        <div className="flex flex-col md:flex-row w-full text-xl md:text-3xl md:justify-center text-means-grey p-4">
            <div className="contents md:flex md:flex-row md:w-5/6">
                <Link
                    className={
                        clsx('w-full flex justify-start md:justify-center',
                        {
                            'hover:text-means-red-hover text-means-red': pathname === baseUrls.ANALYTICS,
                            'hover:text-means-grey-hover': pathname !== baseUrls.ANALYTICS
                        }
                    )}
                    href={baseUrls.ANALYTICS}
                >
                        Analytics
                </Link>
                <div className='hidden md:block'>|</div>
                <Link
                    className={
                        clsx('w-full flex justify-start md:justify-center',
                        {
                            'hover:text-means-red-hover text-means-red': pathname === baseUrls.PAYMENT_INFO,
                            'hover:text-means-grey-hover': pathname !== baseUrls.PAYMENT_INFO
                        }
                    )}
                    href={baseUrls.PAYMENT_INFO}
                >
                    Payment Info
                </Link>
            </div>
            <div className="flex flex-col-reverse md:flex-row-reverse md:w-1/6 md:justify-center text-means-red text-sm md:text-xl md:items-center">
                <div>
                    <button className={clsx("md:p-1 cursor-pointer", {
                        'text-means-pending cursor-auto': signOutPending
                    })} onClick={() => startTransition(signOutAction)}>
                        Log Out
                    </button>
                    <div className={clsx({"hidden": !signOutPending})}>
                        <Spinner />
                    </div>
                </div>
                <div className='hidden md:block text-means-grey m-1'>|</div>
                <div>
                    <Link
                        className={clsx("md:p-1 cursor-pointer", {
                            'hidden': !isAdmin
                        })}
                        href={baseUrls.ADMIN_BASE_URL}
                    >
                        Admin View
                    </Link>
                </div>
            </div>
        </div>
    )
}
