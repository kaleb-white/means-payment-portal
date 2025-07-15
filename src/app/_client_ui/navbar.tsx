'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { baseUrls } from '@/constants'

export default function Navbar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col md:flex-row w-full text-xl md:text-3xl md:justify-center text-means-grey p-4">
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
    )
}
