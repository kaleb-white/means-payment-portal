'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { baseUrls } from '@/configs'
import { signOutSubmit } from '@/lib/services/login'
import { startTransition, useActionState, useEffect, useState } from 'react'
import { Spinner } from './spinner'

export default function Navbar({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname()

    const [inAdmin, setInAdmin] = useState(false)
    useEffect(() => {
        if (pathname.startsWith(baseUrls.ADMIN_BASE_URL)) setInAdmin(true)
    }, [pathname])

    const [_, signOutAction, signOutPending] = useActionState(signOutSubmit, null)

    return (
        <div className={clsx("flex flex-col md:flex-row w-full text-xl md:text-3xl text-means-grey p-4", {
            'md:justify-center': !inAdmin,
            'md: justify-end': inAdmin
        })}>
            <div className={clsx("md:w-5/6", {
                    'hidden': inAdmin,
                    'contents md:flex md:flex-row': !inAdmin
            })}>
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
                    <button className={clsx("md:p-1 cursor-pointer hover:text-means-red-hover", {
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
                        className={clsx("md:p-1 cursor-pointer hover:text-means-red-hover", {
                            'hidden': !isAdmin
                        })}
                        href={inAdmin? baseUrls.ANALYTICS : baseUrls.ADMIN_BASE_URL}
                    >
                        {inAdmin? 'User View' : 'Admin View'}
                    </Link>
                </div>
            </div>
        </div>
    )
}
