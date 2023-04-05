import { collection, doc, DocumentData, DocumentReference, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";
import Layout from "./components/Layout";
import MaterialTable from "./components/MaterialTable";
import { db } from "./firebase";
import { setBatches } from "./redux/useBatches";

export default function App() {
    useEffect(() => {
        const queryRef = query(collection(db, "po07"), where("archived", "==", false));
        const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
            const batches: DocumentData[] = [];
            querySnapshot.forEach((doc) => {
                const newBatch = {
                    id: doc.id,
                    ...doc.data()
                }
                batches.push(newBatch);
                console.log(`${doc.id} => ${doc.data()}`);
            });
            console.log(batches);
            setBatches(batches);
        });
        return unsubscribe;
    }, [])
    return (
        <Layout>
            <main>
                <MaterialTable />
            </main>
        </Layout>
    )
}
