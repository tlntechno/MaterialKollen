import { createReduxModule } from "hooks-for-redux";
import { Line } from "../constants/lines";

export const [useLine, { setLine }] = createReduxModule("line", Line.PO07, {
    setLine: (state, payload) => {
        if (payload === state) return state;
        const allLines = Object.values(Line);
        if (!allLines.includes(payload)) return state;
        localStorage.setItem("line", payload);
        return payload;
    }
});