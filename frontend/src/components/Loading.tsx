import React from 'react'

export default function Loading({ flipped = false }) {
    return (
        <div className={`animate-pulse accentBG2 rounded-md py-1 flex flex-col ${flipped && "items-end"}`}>
            <div className="animate-pulse accentBG rounded-md py-1.5 mx-1">
            </div>
            <div className="animate-pulse accentBG rounded-md py-1.5 mx-1 mt-2 w-2/3">
            </div>
        </div>
    )
}
