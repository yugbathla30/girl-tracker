import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZQWzFE0j1rRqLO2EaVtIQtqs86fLmKWc",
  authDomain: "girl-tracker-for-aru-1f210.firebaseapp.com",
  projectId: "girl-tracker-for-aru-1f210",
  storageBucket: "girl-tracker-for-aru-1f210.firebasestorage.app",
  messagingSenderId: "398507698897",
  appId: "1:398507698897:web:76a8799b9fb7a9f0fe73f0",
  measurementId: "G-1YTR3283L8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CLOUD_NAME = 'girltracker';
const UPLOAD_PRESET = 'girltracker';

export default function GirlTrackerApp() {
  const [girls, setGirls] = useState([]);
  const [name, setName] = useState('');
  const [insta, setInsta] = useState('');
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingNotes, setEditingNotes] = useState('');

  useEffect(() => {
    const fetchGirls = async () => {
      const querySnapshot = await getDocs(collection(db, 'girls'));
      const girlsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGirls(girlsList);
    };
    fetchGirls();
  }, []);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
    return response.data.secure_url;
  };

  const addGirl = async () => {
    let imageUrl = '';
    if (photo) {
      imageUrl = await uploadImage(photo);
    }

    const newGirl = { name, insta, photo: imageUrl, notes };
    const docRef = await addDoc(collection(db, 'girls'), newGirl);
    setGirls([...girls, { id: docRef.id, ...newGirl }]);
    setName('');
    setInsta('');
    setPhoto(null);
    setNotes('');
  };

  const deleteGirl = async (id) => {
    await deleteDoc(doc(db, 'girls', id));
    setGirls(girls.filter(g => g.id !== id));
  };

  const startEditing = (id, currentNotes) => {
    setEditingId(id);
    setEditingNotes(currentNotes);
  };

  const saveNotes = async (id) => {
    await updateDoc(doc(db, 'girls', id), { notes: editingNotes });
    setGirls(girls.map(g => g.id === id ? { ...g, notes: editingNotes } : g));
    setEditingId(null);
  };

  return (
    <div className="container">
      <h1>Bestie Girl Tracker</h1>
      <div className="form">
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Instagram" value={insta} onChange={e => setInsta(e.target.value)} />
        <input type="file" onChange={e => setPhoto(e.target.files[0])} />
        <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={addGirl}>Add Girl</button>
      </div>
      <div className="list">
        {girls.map((girl) => (
          <div key={girl.id} className="card">
            {girl.photo ? (
              <img src={girl.photo} alt={girl.name} />
            ) : (
              <div className="no-image">No Image</div>
            )}
            <h2>{girl.name}</h2>
            <p>{girl.insta}</p>
            {editingId === girl.id ? (
              <div>
                <textarea value={editingNotes} onChange={e => setEditingNotes(e.target.value)} />
                <button onClick={() => saveNotes(girl.id)}>Save</button>
              </div>
            ) : (
              <p>{girl.notes}</p>
            )}
            <button onClick={() => deleteGirl(girl.id)}>Delete</button>
            {editingId !== girl.id && <button onClick={() => startEditing(girl.id, girl.notes)}>Edit Notes</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

