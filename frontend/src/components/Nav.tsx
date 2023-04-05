import React from 'react'
import { addBatch, dbAddBatch } from '../redux/useBatches'
import { FaPlus } from 'react-icons/fa'

export default function Nav() {
    return (
        <nav className='w-full p-3 mainBG shadow-lg'>
            <ul className='flex w-full px-3 justify-between'>
                <li className='relative'><a href="/">
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
                <li className='flex w-fit py-2'><button className='flex justify-center items-center h-full mr-3 aspect-square rounded-md text-gray-900 bg-green-500 hover:brightness-90' onClick={() => dbAddBatch()}><FaPlus className='m-3 full' /></button></li>
            </ul>
        </nav>
    )
}
