import { collection, doc, DocumentData, DocumentReference, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";
import Layout from "./components/Layout";
import MaterialTable from "./components/MaterialTable";
import { db } from "./firebase";
import { setBatches } from "./redux/useBatches";
import { setLine, useLine } from "./redux/useLine";

export default function App() {
    const line = useLine();
    useEffect(() => {
        const queryRef = query(collection(db, line), where("archived", "==", false));
        const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
            const batches: DocumentData[] = [];
            querySnapshot.forEach((doc) => {
                const newBatch = {
                    id: doc.id,
                    ...doc.data()
                }
                batches.push(newBatch);
            });
            setBatches(batches);
        });
        return unsubscribe;
    }, [line])

    useEffect(() => {
        const line = localStorage.getItem("line");
        if (line) {
            setLine(line);
        } else {
            localStorage.setItem("line", "po07");
            setLine("po07");
        }
    }, [])

    return (
        <Layout>
            <main>
                <MaterialTable />
            </main>
        </Layout>
    )
}
