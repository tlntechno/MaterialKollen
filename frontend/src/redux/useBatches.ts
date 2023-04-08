import { collection, doc } from "firebase/firestore";
import { createReduxModule } from "hooks-for-redux";
import { db } from "../firebase";
import _ from "lodash";
import { triggerImmediate, wbSet } from "./useWriteBatch";

export interface Batch {
    id?: string;
    batch: string;
    country: string;
    to: boolean;
    plan: string;
    etik: boolean;
    tp: boolean;
    modifiedAt: Date;
    archived: boolean;
}

export const initialBatch: Batch = {
    batch: "",
    country: "",
    to: false,
    plan: "",
    etik: false,
    tp: false,
    modifiedAt: new Date(),
    archived: false,
}

const initialState: Batch[] = [];

export function handleChange(batch: Batch, field: string, value: any) {
    const newBatch = { ...batch, [field]: value };
    updateBatch(newBatch);
}

export async function dbAddBatch(line: string) {
    wbSet({ doc: doc(collection(db, line)), data: initialBatch });
    triggerImmediate(true);
}

export const [useBatches, { setBatches, updateBatch, addBatch, removeBatch }] = createReduxModule("batches", initialState, {
    setBatches: (state, payload) => {
        return payload;
    },
    updateBatch: (state, payload) => {
        const newBatches = state.map((batch) => {
            if (batch.id === payload.id) {
                return payload;
            }
            return batch;
        })
        return newBatches;
    },
    addBatch: (state) => {
        // initialBatch.id = state.length;
        return [...state, initialBatch];
    },
    removeBatch: (state, payload) => {
        const newBatches = state.filter((batch) => batch.id !== payload.id);
        return newBatches;
    },
});