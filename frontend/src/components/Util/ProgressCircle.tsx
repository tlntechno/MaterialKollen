import React, { useEffect, useRef, useState } from 'react'
import smoothProgress from '../../util/smoothProgress';

export default function ProgressCircle({
    progress,
    radius = 0,
    stroke = 0,
    fontWeight = "",
    color,
    size = "",
    percentage = false
}
    :
    {
        progress: number,
        radius?: number,
        stroke?: number,
        fontWeight?: string,
        color: string,
        size?: string,
        percentage?: boolean
    }
) {

    const [currentProgress, setCurrentProgress] = useState(0);
    const timeoutRef = useRef(null);
    switch (size) {
        case "sm":
            radius = radius ? radius : 25;
            stroke = stroke ? stroke : 3;
            fontWeight = fontWeight ? fontWeight : "normal";
            break;
        case "md":
            radius = radius ? radius : 40;
            stroke = stroke ? stroke : 5;
            fontWeight = fontWeight ? fontWeight : "semibold";
            break;
        case "lg":
            radius = radius ? radius : 60;
            stroke = stroke ? stroke : 7;
            fontWeight = fontWeight ? fontWeight : "semibold";
            break;
        default:
            break;
    }

    const normalizedRadius = radius - stroke * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const offset = circumference - currentProgress / 100 * circumference


    useEffect(() => {
        smoothProgress({ progress, currentProgress, setCurrentProgress, timeoutRef });
    }, [progress]);

    return (
        <div className='relative'>
            {/* <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center'>
                <p className={`font-${fontWeight}`}
                    style={{ fontSize: `${radius / 2.5}px` }}
                >{currentProgress}{percentage ? "%" : ""}</p>
            </div> */}
            <svg
                className="progress-ring"
                height={radius * 2}
                width={radius * 2}
            >
                <circle
                    className={`progress-ring__circle stroke-slate-200 dark:stroke-slate-800`}
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    className={`progress-ring__circle ${color} stroke-blue-400`}
                    style={{
                        strokeDashoffset: offset,
                        strokeDasharray: `${circumference} ${circumference}`,
                        // transition: "stroke-dashoffset 0.35s",
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%"
                    }}
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
        </div>
    )
}
