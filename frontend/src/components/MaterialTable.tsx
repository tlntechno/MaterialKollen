import { useCallback, useEffect, useMemo, useState } from 'react'
import { Batch, removeBatch, updateBatch, useBatches } from '../redux/useBatches'
import { MdLocalShipping, MdVideoLabel } from 'react-icons/md'
import { BiCylinder } from 'react-icons/bi'
import SegmentedControl from './SegmentedControl';
import _ from 'lodash';
import { doc, WriteBatch } from '@firebase/firestore';
import { db } from '../firebase';
import Loading from './Loading';
import { Flipped, Flipper } from 'react-flip-toolkit';
import { BsFillTrash3Fill } from 'react-icons/bs';
import { resetWriteBatch, useWriteBatch } from '../redux/useWriteBatch';
import { useLine } from '../redux/useLine';

// Variables to determine sticky lengths for remove slider

const startPos = 0;
const endPos = 100;
const removeTreshSticky = 60;
const removeStickyPos = -100;
const cancelTreshSticky = 20;
const cancelStickyPos = 0;
const removeDelay = 30;
const cancelDelay = 30;

export default function MaterialTable() {
    const { batches, hydrated } = useBatches();
    const line = useLine();
    const { writeBatch, immediate } = useWriteBatch();
    const [confirmArchive, setConfirmArchive] = useState("");
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeStartX, setSwipeStartX] = useState(0);
    const [swipeDistance, setSwipeDistance] = useState(0);
    const [swipeStick, setSwipeStick] = useState(false);

    const sortedBatches = batches.sort((a, b) => {
        if (a.plan < b.plan) return -1;
        if (a.plan > b.plan) return 1;
        return 0;
    })

    const updateBatchDB = useCallback((batch: WriteBatch) => {
        console.log("Updating batch")
        batch.commit();
        resetWriteBatch();
    }, [])

    const debouncedUpdate = useMemo(() => {
        return _.debounce(updateBatchDB, 5000)
    }, [updateBatchDB])

    function handleChange(batch: Batch, key: string, value: string | boolean, instant = false) {
        const newBatch = {
            ...batch,
            [key]: value
        }
        if (!batch.id) return;
        writeBatch.update(doc(db, line, batch.id), {
            [key]: value
        })
        updateBatch(newBatch);
        instant && updateBatchDB(writeBatch);
        !instant && debouncedUpdate(writeBatch);
    }

    useEffect(() => {
        if (immediate) {
            updateBatchDB(writeBatch);
            debouncedUpdate.cancel();
        }
    }, [immediate])

    useEffect(() => {
        const timeout = setTimeout(() => {
            const batch = batches.find((batch) => batch.id === confirmArchive);
            if (batch) {
                removeBatch(batch);
                handleChange(batch, "archived", true, true);
            }
            setConfirmArchive("");
        }, 200);
        return () => clearTimeout(timeout);
    }, [confirmArchive, batches, handleChange])



    const handleTouchStart = (event: any) => {
        event.stopPropagation();
        setIsSwiping(true);
        setSwipeStartX(event.touches[0].clientX);
    };

    const handleTouchMove = (event: any, batch: Batch) => {
        event.stopPropagation();
        if (!isSwiping) {
            return;
        }



        const deltaX = event.touches[0].clientX - swipeStartX;

        const sd = () => {
            if (deltaX > startPos) return 0;
            if (Math.abs(deltaX) > endPos) return -endPos;
            return Number(deltaX.toFixed(2));
        }

        event.target.style.animationDelay = `${sd() / 100}s`;

        if (deltaX > startPos) return;
        if (Math.abs(deltaX) > endPos) return;
        if (Math.abs(deltaX) > removeTreshSticky) {
            setSwipeStick(true);
            event.target.style.transition = `all ${removeDelay}ms ease-in`;
            setSwipeDistance(removeStickyPos);
            event.target.style.transform = `translateX(${removeStickyPos}px) scale(${1 + Math.abs(deltaX) / 2000})`;
            event.target.style.boxShadow = '0 0 10px 0 rgba(0,0,0,0.5), 0 0 0 2px rgba(255, 255, 0, 0.5)'
            return
        }
        // if (swipeStick && Math.abs(deltaX) < cancelTreshSticky) {
        //     setSwipeStick(true);
        //     event.target.style.transition = `all ${cancelDelay}ms ease-in`;
        //     setSwipeDistance(cancelStickyPos);
        //     event.target.style.transform = `translateX(${cancelStickyPos}px) scale(1)`;
        //     event.target.style.boxShadow = 'none'
        //     return
        // }
        if (event.target.style.transition !== '') {
            setTimeout(() => {
                event.target.style.transition = '';
            }, removeDelay + Math.abs(deltaX));
        }
        setSwipeDistance(deltaX);
        event.target.style.transform = `translateX(${deltaX}px) scale(${1 + Math.abs(deltaX) / 2000})`;
        event.target.style.boxShadow = 'none'
    };

    const handleTouchEnd = (event: any, batch: Batch) => {
        event.stopPropagation();
        setIsSwiping(false);
        event.target.style.animationDelay = `0s`;

        if (Math.abs(swipeDistance) === endPos) {
            removeBatch(batch);
            handleChange(batch, "archived", true, true);
        } else {
            event.target.style.transition = 'all 0.2s ease-in-out';
            event.target.style.boxShadow = 'none'
            event.target.style.transform = 'translateX(0) scale(1)';
            setTimeout(() => {
                event.target.style.transition = '';
            }, 200);
        }
        setSwipeDistance(0);
    };

    return (
        <div className="p-5">
            <Flipper flipKey={sortedBatches.map((batch) => batch.id)}>
                <table className="">
                    <colgroup>
                        <col className="" />
                        <col className="w-1/12" />
                        <col className="w-[12%]" />
                        <col className="w-1/6" />
                        <col className="w-[12%]" />
                        <col className="w-[12%]" />
                        <col className="w-[5%]" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Batch</th>
                            <th>Land</th>
                            <th>TO-lagt</th>
                            <th>Planerad start</th>
                            <th>Etiketter</th>
                            <th>Täckpapper</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedBatches.length === 0 && !hydrated &&
                            <tr>
                                <td><Loading /></td>
                                <td><Loading flipped /></td>
                                <td><Loading /></td>
                                <td><Loading flipped /></td>
                                <td><Loading /></td>
                                <td><Loading /></td>
                                <td><Loading flipped /></td>
                            </tr>
                        }
                        {
                            sortedBatches.length === 0 && hydrated &&
                            <tr>
                                <td colSpan={7} className="text-center text-gray-500">Inga batcher</td>
                            </tr>
                        }
                        {sortedBatches.length > 0 && sortedBatches.map((batch: Batch, index) => (
                            <Flipped key={batch.id} flipId={batch.id}>
                                <tr
                                    id={`tr-${batch.id}`}
                                // className={`transition-all duration-200 ${isSwiping ? "brightness-50" : ""}`}
                                >
                                    <td className={`${confirmArchive === batch.id ? "borderFade" : ""}`}>
                                        <textarea
                                            id={`batch-${batch.id}`}
                                            value={batch.batch}
                                            placeholder="Batch"
                                            rows={1}
                                            onChange={(e) => { handleChange(batch, "batch", e.target.value) }}
                                            className="resize-none font-semibold bg-transparent h-fit" />
                                    </td>
                                    <td className={`${confirmArchive === batch.id ? "borderFade" : ""}`}>
                                        <textarea
                                            value={batch.country}
                                            placeholder="Land"
                                            rows={1}
                                            maxLength={2}
                                            onChange={(e) => {
                                                typeof e.target.value === 'string' &&
                                                    handleChange(batch, "country", e.target.value.toUpperCase())
                                            }}
                                            className="resize-none text-center font-semibold bg-transparent h-fit" />
                                    </td>
                                    <td className={`${confirmArchive === batch.id ? "borderFade" : ""}`}>
                                        <SegmentedControl
                                            options={[false, true]}
                                            selected={batch.to}
                                            setSelected={() => { handleChange(batch, "to", !batch.to) }}
                                            icon={<MdLocalShipping className="fill-gray-800"
                                            />}
                                        />
                                    </td>
                                    <td className={`${confirmArchive === batch.id ? "borderFade" : ""}`}>
                                        <input type="date" title='Planerad start' placeholder='Planerad start' className={`w-full h-full bg-transparent`} onChange={(e) => { handleChange(batch, "plan", e.target.value) }} value={batch.plan} />
                                    </td>
                                    <td className={`${confirmArchive === batch.id ? "borderFade" : ""}`}>
                                        <SegmentedControl
                                            options={[false, true]}
                                            selected={batch.etik}
                                            setSelected={() => { handleChange(batch, "etik", !batch.etik) }}
                                            icon={
                                                <MdVideoLabel className="fill-gray-800" />
                                            }
                                        />
                                    </td>
                                    <td className={`${confirmArchive === batch.id ? "borderFade" : ""}`}>
                                        <SegmentedControl
                                            options={[false, true]}
                                            selected={batch.tp}
                                            setSelected={() => { handleChange(batch, "tp", !batch.tp) }}
                                            icon={<BiCylinder className="fill-gray-800" />}
                                        />
                                    </td>
                                    <td className={`px-2 z-20 relative msEdgeFixSigh ${confirmArchive === batch.id ? "borderFade" : ""}`} id={"remove-" + batch.id}>

                                        <button
                                            onTouchStart={handleTouchStart}
                                            onTouchMove={(e) => handleTouchMove(e, batch)}
                                            onTouchEnd={(e) => handleTouchEnd(e, batch)}
                                            className={`full min-h-full aspect-square rounded-md animateColors msEdgeFixSigh z-30 ${isSwiping && index % 2 === 0 ? "accentBG2 shadow-md" : "accentBG shadow-md"}`}>
                                            <div className="full flex flex-col justify-center items-center msEdgeFixSigh pointer-events-none">
                                                <BsFillTrash3Fill className='text-xl' />
                                            </div>
                                        </button>
                                        <div className={`removeOverlay ${isSwiping ? "opacity-100" : "opacity-0"}`}>
                                        </div>
                                    </td>
                                </tr>
                            </Flipped>
                        ))}
                    </tbody>
                </table>
            </Flipper>
        </div>
    )
}
