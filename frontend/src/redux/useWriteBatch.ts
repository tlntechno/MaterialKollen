import { writeBatch } from "firebase/firestore";
import { createReduxModule } from "hooks-for-redux";
import { db } from "../firebase";

export const [useWriteBatch, { resetWriteBatch, triggerImmediate, wbSet }] = createReduxModule("writeBatch", {
    writeBatch: writeBatch(db),
    immediate: false
}, {
    resetWriteBatch: (state) => {
        return {
            writeBatch: writeBatch(db),
            immediate: false
        }
    },
    triggerImmediate: (state, payload) => {
        return {
            ...state,
            immediate: payload
        }
    },
    wbSet: (state, payload) => {
        const wb = state.writeBatch.set(payload.doc, payload.data);
        return {
            ...state,
            writeBatch: wb,
            immediate: false
        }
    }
});