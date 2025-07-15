'use client'

export function AnalyticsLoading() {
    return (
        <div className="animate-pulse w-full md:w-4/5 h-96 mx-auto p-4 my-4 md:my-8 flex flex-col gap-4">
            <div className="w-full h-full rounded-sm bg-gray-600 mx-auto"></div>

            <div className="flex flex-row justify-items-center items-center min-w-full">
                <div className="w-24 h-12 rounded-sm bg-gray-600 mx-auto"></div>
                <div className="md:hidden w-48 h-12 rounded-sm bg-gray-600 mx-auto"></div>

                <div className="hidden md:block w-36 h-12 rounded-sm bg-gray-600 mx-auto"></div>
                <div className="hidden md:block w-36 h-12 rounded-sm bg-gray-600 mx-auto"></div>
                <div className="hidden md:block w-36 h-12 rounded-sm bg-gray-600 mx-auto"></div>
                <div className="hidden md:block w-36 h-12 rounded-sm bg-gray-600 mx-auto"></div>
            </div>

            <div className="w-30 md:w-60 h-6 bg-gray-600 justify-self-start"></div>
            <div className="w-36 md:w-70 h-6 bg-gray-600 justify-self-start"></div>
        </div>
)}
