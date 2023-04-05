import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {

    apiKey: "AIzaSyCvg1ZAVGP7jxUnJxC_kLLJuEC1hRWwjmk",

    authDomain: "materialkollen.firebaseapp.com",

    projectId: "materialkollen",

    storageBucket: "materialkollen.appspot.com",

    messagingSenderId: "102774217288",

    appId: "1:102774217288:web:1d3d1fa78fb7324e51167d"

};


// Initialize Firebase

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);