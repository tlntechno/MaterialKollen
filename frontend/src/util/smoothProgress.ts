import { useRef } from "react";

export default function smoothProgress({
    progress,
    currentProgress,
    setCurrentProgress,
    delay = 9,
    timeoutRef
}
    :
    {
        progress: number,
        currentProgress: number,
        setCurrentProgress: (progress: number) => void,
        delay?: number,
        timeoutRef: any
    }
) {
    function recursive(i: number = 0) {
        const difference = progress - currentProgress;
        const x = i / (progress - currentProgress)
        const curve = (3 * Math.pow(x, 2) + (x * -1) + 0.5) * delay
        if (i < difference) {
            setCurrentProgress(currentProgress + (currentProgress - (currentProgress - i)));
            timeoutRef.current = setTimeout(() => recursive(i + 1), curve);
        } else if (i > difference) {
            setCurrentProgress(currentProgress - (currentProgress - (currentProgress + i)));
            timeoutRef.current = setTimeout(() => recursive(i - 1), curve);
        } else {
            setCurrentProgress(progress);
            return
        }
    }
    clearTimeout(timeoutRef.current);
    recursive();
}