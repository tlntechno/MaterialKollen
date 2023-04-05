import React from 'react'

export default function SegmentedControl(
    { options, selected, setSelected, icon }:
        { options: string[] | boolean[], selected: string | boolean, setSelected: (selected: string | boolean) => void, icon: JSX.Element }
) {
    function styles(option: string | boolean) {
        const opt = option.toString();
        const sel = selected.toString();

        if (opt === sel) {
            return opt === "true" ? "bg-green-600 rounded-md brightness-125" : "bg-red-400 bg-opacity-90 rounded-l-md"
        }
        return opt === "true" ? "bg-green-500 rounded-r-md bg-opacity-30" : "bg-red-400 rounded-l-md bg-opacity-30"
    }
    return (
        <div className="relative flex full">
            {options.map((option, index) => (
                <div key={index} className={`flex flex-1 items-center justify-center shadow-md  ${index === 0 ?
                    option === selected ?
                        "basis-2/3" :
                        "basis-0"
                    :
                    option === selected ?
                        "basis-full" :
                        "basis-1/3"
                    } transition-all`}>
                    <button
                        onClick={() => setSelected(option)}
                        className={`flex flex-1 px-auto h-8 items-center justify-center py-2 transition-all duration-200 ${styles(option)}`}
                    >
                        {/* {option === selected && icon} */}
                        {index === 0 && <div className={`absolute z-10 flex items-center justify-center transition-all duration-200 top-0 bottom-0 -translate-x-1/2 ${selected ? "left-1/2" : "left-1/3"}`}>
                            {icon}
                        </div>
                        }
                    </button>
                </div>
            ))}

        </div>
    )
}
