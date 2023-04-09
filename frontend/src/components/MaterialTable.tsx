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

export default function MaterialTable() {
    const { batches, hydrated } = useBatches();
    const line = useLine();
    const { writeBatch, immediate } = useWriteBatch();
    const [confirmArchive, setConfirmArchive] = useState("");

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

    // const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    // console.log("isTouchDevice", isTouchDevice);

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
                                    className={`transition-opacity duration-200 ${confirmArchive === batch.id ? "opacity-5" : "opacity-100"}`}
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
                                    <td className={`p-0 relative msEdgeFixSigh ${confirmArchive === batch.id ? "borderFade" : ""}`} id={"remove-" + batch.id}>
                                        <button
                                            // onMouseDown={() => {
                                            //     !confirmArchive && !isTouchDevice && batch.id && setConfirmArchive(batch.id); console.log("onMouseDown")
                                            // }}
                                            // onMouseUp={() => confirmArchive && !isTouchDevice && setConfirmArchive("")}
                                            onPointerDown={(e) => {
                                                e.preventDefault();
                                                !confirmArchive && batch.id && setConfirmArchive(batch.id);
                                            }}
                                            onPointerUp={(e) => {
                                                e.preventDefault();
                                                confirmArchive && setConfirmArchive("");
                                            }}
                                            className="relative full min-h-full py-4 msEdgeFixSigh">
                                            <div className="full flex flex-col justify-center items-center msEdgeFixSigh">
                                                <BsFillTrash3Fill className='text-xl fill-red-500' />
                                            </div>
                                            {/* <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center transition-all duration-300 msEdgeFixSigh ${confirmArchive === batch.id ? "opacity-100" : "opacity-0"}`}>
                                                <ProgressCircle
                                                    progress={confirmArchive === batch.id ? 100 : 0}
                                                    color="bg-blue-300"
                                                    size='sm'
                                                />
                                            </div> */}
                                        </button>
                                        <div className={`absolute z-10 -top-3/4 right-3 w-[300%] py-1 px-2 accentBG3 border border-gray-800 h-fit flex justify-center items-center rounded-md pointer-events-none shadow-xl ${confirmArchive === batch.id ? "fadeInTT" : "fadeOutTT"}`}>
                                            Håll in för att ta bort
                                        </div>
                                    </td>
                                </tr>
                            </Flipped>
                        ))}
                    </tbody>
                </table>
            </Flipper>
            {/* <div
                id='archiveBtn'
                className={`absolute p-2 flex accentBG2 w-fit border border-gray-800 justify-center items-center transition-all duration-300 ${confirmArchive !== "" ? "opacity-100" : "opacity-0"}`}
                style={{
                    // transform: `translate(${archiveBtnRect ? -archiveBtnRect.left : 0}px, ${archiveBtnRect ? -archiveBtnRect.top : 0}px)`
                    transform: `translate(${archiveBtnRect.left - (document.getElementById("archiveBtn")?.offsetWidth / 2)}px, ${archiveBtnRect.top - document.getElementById("archiveBtn")?.offsetHeight}px)`

                }}
            >
                Håll in för att ta bort
            </div> */}
        </div>
    )
}
