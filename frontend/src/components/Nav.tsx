import { dbAddBatch } from '../redux/useBatches'
import { FaPlus } from 'react-icons/fa'
import { setLine, useLine } from '../redux/useLine';
import { BiChevronDown } from 'react-icons/bi';
import { useEffect, useState } from 'react';
import { Line } from '../constants/lines';

export default function Nav() {
    const line = useLine();
    const [changeLine, setChangeLine] = useState(false);

    useEffect(() => {
        if (changeLine)
            document.getElementById('changeLine')?.focus();
    }, [changeLine])
    return (
        <nav className='w-full p-3 mainBG shadow-lg h-[90px]'>
            <ul className='flex w-full h-full px-3'>
                <li className='relative flex-1'><a href="/">
                    <h1 className='text-sm font-semibold flex items-start'>
                        <span className='text-3xl my-2.5 mb-5'>
                            M
                        </span>
                        <span className='mt-3 ml-[1px]'>
                            ATERIAL
                        </span>
                    </h1>
                    <h1 className='absolute bottom-1 left-[23px] text-sm font-semibold flex items-end'>
                        <span className='text-3xl ml-1'>
                            K
                        </span>
                        <span className='mb-[3px]'>
                            OLLEN
                        </span>
                    </h1>
                </a></li>
                <li
                    className='relative flex flex-1 text-3xl items-center justify-center'

                >
                    <div className='relative flex items-center cursor-pointer'
                        onClick={() => {
                            setChangeLine(prev => !prev);
                        }}
                    >
                        <h1>
                            {line}
                        </h1>
                        <p className='absolute right-0 translate-x-5'>
                            <BiChevronDown className={`text-xl transition-all ${changeLine ? "rotate-180" : ""}`} />
                        </p>
                    </div>
                    {changeLine && (
                        <div
                            id='changeLine'
                            className='absolute z-10 top-14 right-1/2 translate-x-1/2 w-34 accentBG rounded-md shadow-lg overflow-hidden'
                            onBlur={() => setChangeLine(false)}
                            tabIndex={0}
                        >
                            {Object.keys(Line).map((line) => (
                                <div className='p-2 px-4 text-xl hover:accentBG2 cursor-pointer' onClick={() => {
                                    setLine(line);
                                    setChangeLine(false);
                                }}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    )}
                </li>
                <li className='flex flex-1 justify-end w-fit py-2'>
                    <button
                        className='flex justify-center items-center font-semibold h-full rounded-md px-5 py-1 text-gray-900 bg-green-500 hover:brightness-90'
                        onClick={() => dbAddBatch(line)}>
                        <FaPlus className='mr-3' /><p>Lägg till batch</p>
                    </button>
                </li>
            </ul>
        </nav>
    )
}
