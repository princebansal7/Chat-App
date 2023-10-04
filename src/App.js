import React, { useState, useRef } from "react";
import firebase from "firebase/compat/app";
import "./App.css";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/analytics";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
    apiKey: "AIzaSyAy1aKjyWDnu5ApTG7CNhbASfI0kaTwrJg",
    authDomain: "react-chat-app-1-b0caf.firebaseapp.com",
    projectId: "react-chat-app-1-b0caf",
    databaseURL: "https://react-chat-app-1-b0caf.firebaseio.com",
    storageBucket: "react-chat-app-1-b0caf.appspot.com",
    messagingSenderId: "1050638599642",
    appId: "1:1050638599642:web:171a301138d2d253f16ce3",
    measurementId: "G-T6M1JD9ZVN",
});

const auth = firebase.auth(); // gives all info about firebase autheticated user
const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth); // will store user's sign in info
    // console.log(user);

    return (
        <div className="App">
            <header>
                <h1>Let's Chat 💬</h1>
                <SignOut />
            </header>

            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    );
}

function SignIn() {
    const signinWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return (
        <div>
            <button className="sign-in" onClick={signinWithGoogle}>
                Sign in
            </button>
            <p> Let's chat about the things, Have fun!</p>
        </div>
    );
}

function SignOut() {
    // if user is already signed in => signout button should be there
    return (
        auth.currentUser && (
            <button className="sign-out" onClick={() => auth.signOut()}>
                Sign Out
            </button>
        )
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    // to style css class left and right side according to the message sent by users

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
        <>
            <div className={`message ${messageClass}`}>
                <img
                    src={
                        photoURL ||
                        "https://api.adorable.io/avatars/23/abott@adorable.png"
                    }
                    alt="user-profile"
                />
                <p>{text}</p>
            </div>
        </>
    );
}

function ChatRoom() {
    // every message will have same structure, just different content and by whom it was sent =>[user (right side) or others (left side)]

    const dummy = useRef();
    const messagesRef = firestore.collection("messages");
    const query = messagesRef.orderBy("createdAt").limit(50);
    const [messages] = useCollectionData(query, { idField: "id" });
    const [formValue, setFormValue] = useState("");

    const sendMessage = async val => {
        val.preventDefault();
        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        });
        setFormValue("");
        dummy.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            <main>
                {messages &&
                    messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                <span ref={dummy}></span>
            </main>
            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={val => setFormValue(val.target.value)}
                    placeholder="Enter message here.."
                />
                <button
                    className="submit-btn"
                    type="submit"
                    disabled={!formValue}
                >
                    Send
                </button>
            </form>
        </>
    );
}

export default App;
