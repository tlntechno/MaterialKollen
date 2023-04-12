import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { FiChevronLeft } from 'react-icons/fi';

// Variables to determine sticky lengths for remove slider

const startPos = 0;
const endPos = 100;
const removeTreshSticky = 50;
const removeStickyPos = -100;
const removeDelay = 50;

export default function MaterialTable() {
    const { batches, hydrated } = useBatches();
    const line = useLine();
    const { writeBatch, immediate } = useWriteBatch();
    const [confirmArchive, setConfirmArchive] = useState("");
    const [isSwiping, setIsSwiping] = useState("");
    const [swipeStartX, setSwipeStartX] = useState(0);
    const [swipeDistance, setSwipeDistance] = useState(0);
    const [tooltip, setTooltip] = useState("");
    const rafRef = useRef(0);
    const timeRef = useRef(0);

    const sortedBatches = batches.sort((a, b) => {
        if (a.plan < b.plan) return -1;
        if (a.plan > b.plan) return 1;
        return 0;
    })

    const updateBatchDB = useCallback((batch: WriteBatch) => {
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
        }, 300);
        return () => clearTimeout(timeout);
    }, [confirmArchive, batches, handleChange])

    function paint({ transition = "", animationDelay = "", boxShadow = "", transform = "", target }: { transition?: string, animationDelay?: string, boxShadow?: string, transform?: string, target: any }) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame((time) => {
            timeRef.current = time;
            if (target) {
                if (transition) target.style.transition = transition;
                if (animationDelay) target.style.animationDelay = animationDelay;
                if (boxShadow) target.style.boxShadow = boxShadow;
                if (transform) target.style.transform = transform;
            }
        })
    }

    const handleTouchStart = (event: any, batch: Batch) => {
        event.stopPropagation();
        batch.id && setIsSwiping(batch.id);
        setTooltip("");
        setSwipeStartX(event.touches[0].clientX);
    };

    const handleTouchMove = (event: any, batch: Batch) => {
        event.stopPropagation();
        if (tooltip !== "") setTooltip("");
        if (!isSwiping) return;
        const deltaX = event.touches[0].clientX - swipeStartX;

        // const btn = document.getElementById(`remove-${batch.id}`);
        // if (btn) {
        //     // get current transformed position of button compared to the starting position
        //     const btnPos = Number(btn.style.transform.replace(/translate3d\(/, '').replace(/px, 0px, 0px\)/, ''));
        //     console.log(btnPos)

        // }

        const sd = () => {
            if (deltaX > startPos) return 0;
            if (Math.abs(deltaX) > endPos) return -endPos;
            return Number(deltaX.toFixed(2));
        }

        if (deltaX > startPos) return;
        if (Math.abs(deltaX) > endPos) return;
        if (Math.abs(deltaX) > removeTreshSticky) {
            setSwipeDistance(removeStickyPos);
            paint({
                target: event.target,
                transition: `all ${removeDelay}ms ease-out`,
                animationDelay: `-1s`,
                boxShadow: '0 0 10px 0 rgba(0,0,0,0.5), 0 0 0 2px rgba(255, 255, 0, 0.5)',
                transform: `translate3d(${removeStickyPos}px, 0, 0) scale(${1 + Math.abs(deltaX) / 2000})`
            })
            return
        }
        if (event.target.style.transition !== '') {
            setTimeout(() => {
                paint({
                    target: event.target,
                    transition: ''
                })
            }, removeDelay + 10);
        }
        setSwipeDistance(deltaX);
        paint({
            target: event.target,
            animationDelay: `${sd() / 100}s`,
            boxShadow: 'none',
            transform: `translate3d(${deltaX}px, 0, 0) scale(${1 + Math.abs(deltaX) / 2000})`
        })
    };


    const handleTouchEnd = (event: any, batch: Batch) => {
        event.stopPropagation();
        setIsSwiping("");

        if (Math.abs(swipeDistance) === endPos) {
            removeBatch(batch);
            handleChange(batch, "archived", true, true);
        } else {
            // event.target.style.transition = 'all 0.2s ease-in-out';
            // event.target.style.boxShadow = 'none'
            // event.target.style.transform = 'translateX(0) scale(1)';
            paint({
                target: event.target,
                transition: 'all 0.2s ease-in-out',
                boxShadow: 'none',
                transform: 'translateX(0) scale(1)'
            })
            setTimeout(() => {
                event.target.style.transition = '';
            }, 200);
        }
        event.target.style.animationDelay = `0s`;
        setSwipeDistance(0);
    };

    useEffect(() => {
        if (tooltip !== '') {
            const timeout = setTimeout(() => {
                setTooltip('')
            }, 2800);
            return () => clearTimeout(timeout);
        }
    }, [tooltip])

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
                                    className={`transition-all duration-300 ${confirmArchive === batch.id ? "opacity-0" : "opacity-100"}`}
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
                                            onClick={() => batch.id && setTooltip(batch.id)}
                                            onMouseDown={() => batch.id && setConfirmArchive(batch.id)}
                                            onMouseUp={() => batch.id && setConfirmArchive("")}
                                            onTouchStart={(e) => handleTouchStart(e, batch)}
                                            onTouchMove={(e) => handleTouchMove(e, batch)}
                                            onTouchEnd={(e) => handleTouchEnd(e, batch)}
                                            className={`full min-h-full aspect-square rounded-md animateColors msEdgeFixSigh z-30 ${isSwiping && index % 2 === 0 ? "accentBG2" : "accentBG"}`}>
                                            <div className="full flex flex-col justify-center items-center msEdgeFixSigh pointer-events-none">
                                                <BsFillTrash3Fill className='text-xl' />
                                            </div>
                                        </button>
                                        <div className={`removeOverlay ${isSwiping === batch.id ? "opacity-100" : "opacity-0"}`}>
                                        </div>
                                        <div className={`tooltip ${tooltip === batch.id ? "opacity-100" : "opacity-0"}`}>
                                            <div className="flex justify-evenly items-center text-3xl text-slate-400">
                                                <FiChevronLeft className='text-lg' />
                                                <FiChevronLeft className='text-xl' />
                                                <FiChevronLeft className='text-2xl' />
                                                <FiChevronLeft className='text-3xl' />
                                            </div>
                                            <div className={`${tooltip === batch.id ? "animateSwipe" : "opacity-0"} h-5/6 aspect-square bg-slate-300 rounded-md border-2 border-slate-600 transition-all`}>
                                                <div className="full flex flex-col justify-center items-center msEdgeFixSigh pointer-events-none text-red-500">
                                                    <BsFillTrash3Fill className='text-xl' />
                                                </div>
                                            </div>
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
