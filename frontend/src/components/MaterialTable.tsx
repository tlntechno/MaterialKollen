import React, { useCallback, useContext, useMemo, useReducer, useState } from 'react'
import { Batch, updateBatch, useBatches } from '../redux/useBatches'
import { MdLocalShipping, MdVideoLabel } from 'react-icons/md'
import { BiCylinder } from 'react-icons/bi'
import SegmentedControl from './SegmentedControl';
import _ from 'lodash';
import { doc, WriteBatch, writeBatch } from '@firebase/firestore';
import { db } from '../firebase';
import { updateDoc } from 'firebase/firestore';
import Loading from './Loading';
import { Flipped, Flipper } from 'react-flip-toolkit';

export default function MaterialTable() {
    const batches = useBatches();

    const [pendingUpdates, setPendingUpdates] = useState<Batch[]>([]);

    const sortedBatches = batches.sort((a, b) => {
        if (a.plan < b.plan) return -1;
        if (a.plan > b.plan) return 1;
        return 0;
    })

    const updateBatchDB = useCallback((batch: WriteBatch) => {
        // const batchRef = doc(db, "po07", batch.id);
        // updateDoc(batchRef, {
        //     ...batch
        // });
        batch.commit();
    }, [])

    const debouncedUpdate = useMemo(() => {
        return _.debounce(updateBatchDB, 5000)
    }, [updateBatchDB])

    function handleChange(batch: Batch, key: string, value: string | boolean) {
        const newBatch = {
            ...batch,
            [key]: value
        }
        const fbBatch = writeBatch(db);
        if (!batch.id) return;
        fbBatch.update(doc(db, "po07", batch.id), {
            [key]: value
        })
        updateBatch(newBatch);
        debouncedUpdate(fbBatch);
    }

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
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Batch</th>
                            <th>Land</th>
                            <th>TO-lagt</th>
                            <th>Planerad start</th>
                            <th>Etiketter</th>
                            <th>Täckpapper</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedBatches.length === 0 &&
                            <tr>
                                <td><Loading /></td>
                                <td><Loading flipped /></td>
                                <td><Loading /></td>
                                <td><Loading flipped /></td>
                                <td><Loading /></td>
                                <td><Loading flipped /></td>
                            </tr>
                        }
                        {sortedBatches.length > 0 && sortedBatches.map((batch: Batch, index) => (
                            <Flipped key={batch.id} flipId={batch.id}>
                                <tr>
                                    <td>
                                        <textarea
                                            value={batch.batch}
                                            placeholder="Batch"
                                            rows={1}
                                            onChange={(e) => { handleChange(batch, "batch", e.target.value) }}
                                            className="resize-none font-semibold bg-transparent h-fit" />
                                    </td>
                                    <td>
                                        <textarea
                                            value={batch.country}
                                            placeholder="Land"
                                            rows={1}
                                            maxLength={2}
                                            onChange={(e) => { handleChange(batch, "country", e.target.value) }}
                                            className="resize-none text-center font-semibold bg-transparent h-fit" />
                                    </td>
                                    <td>
                                        <SegmentedControl
                                            options={[false, true]}
                                            selected={batch.to}
                                            setSelected={() => { handleChange(batch, "to", !batch.to) }}
                                            icon={<MdLocalShipping className="fill-gray-800"
                                            />}
                                        />
                                    </td>
                                    <td className='relative'>
                                        {/* <textarea
                                    value={batch.plan}
                                    placeholder="Planerad start"
                                    rows={1}
                                    onFocus={() => setPlanFocus(true)}
                                    onBlur={() => setPlanFocus(false)}
                                    onChange={(e) => { handleChange(batch, "plan", e.target.value) }}
                                    className="resize-none font-semibold bg-transparent h-fit"
                                /> */}
                                        <input type="date" className={`w-full h-full bg-transparent`} onChange={(e) => { handleChange(batch, "plan", e.target.value) }} value={batch.plan} />
                                    </td>
                                    <td>
                                        <SegmentedControl
                                            options={[false, true]}
                                            selected={batch.etik}
                                            setSelected={() => { handleChange(batch, "etik", !batch.etik) }}
                                            icon={
                                                <MdVideoLabel className="fill-gray-800" />
                                            }
                                        />
                                    </td>
                                    <td>
                                        <SegmentedControl
                                            options={[false, true]}
                                            selected={batch.tp}
                                            setSelected={() => { handleChange(batch, "tp", !batch.tp) }}
                                            icon={<BiCylinder className="fill-gray-800" />}
                                        />
                                    </td>
                                    {/* <td><MdVideoLabel className={`${batch.etik ? "fill-green-500" : "fill-yellow-400"}`} /></td>
                            <td><BiCylinder className={`${batch.etik ? "fill-green-500" : "fill-yellow-400"}`} /></td> */}
                                </tr>
                            </Flipped>
                        ))}
                    </tbody>
                </table>
            </Flipper>
        </div>
    )
}
