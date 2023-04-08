import React, { useEffect, useRef, useState } from 'react'
import smoothProgress from '../../util/smoothProgress';

export default function ProgressBar(
    {
        progress,
        height,
        fontWeight = "",
        colorTrack,
        colorProgress,
        percentage = false,
        rounded = "none",
        delay = 40
    }
        :
        {
            progress: number,
            height: number,
            fontWeight?: string,
            colorTrack: string,
            colorProgress: string,
            percentage?: boolean,
            rounded?: string,
            delay?: number
        }

): JSX.Element {
    const [currentProgress, setCurrentProgress] = useState(0);
    const timeoutRef = useRef(null);
    useEffect(() => {
        smoothProgress({ progress, currentProgress, setCurrentProgress, delay, timeoutRef });
    }, [progress]);

    return (
        <div
            className={`relative w-full overflow-hidden ${colorTrack} rounded-${rounded}`}
            style={{ height: `${height}px`, lineHeight: `${height}px` }}
        >
            {percentage && <p className={`absolute z-10 pl-2 text-black font-${fontWeight}`}
                style={{ fontSize: `${height}px` }}
            >{currentProgress}{percentage ? "%" : ""}</p>}
            <div className={`absolute top-0 left-0 w-full h-full ${colorProgress}`} style={{ width: `${currentProgress}%`, transition: "width 20ms" }}>

            </div>
        </div>
    )
}
