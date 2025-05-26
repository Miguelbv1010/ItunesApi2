import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-:.\' '.split('');
const MAX_ATTEMPTS = 5;

export default function JuegoRegueton() {
  const [artistName, setArtistName] = useState('');
  const [artwork, setArtwork] = useState('');
  const [trackId, setTrackId] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userWin, setUserWin] = useState(0);
  const [userLose, setUserLose] = useState(0);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!uid) return;
    const traerDatos = async () => {
      const docRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserWin(data.ganados || 0);
        setUserLose(data.perdidos || 0);
      } else {
        await setDoc(docRef, { ganados: 0, perdidos: 0 });
      }
      setLoading(false);
    };
    traerDatos();
  }, [uid]);

  const guardarResultado = async (acierto) => {
    if (!uid) return;
    const fecha = new Date().toISOString();
    const resultado = {
      uid,
      artista: artistName,
      aciertos: acierto ? 1 : 0,
      errores: acierto ? 0 : 1,
      fecha,
    };
    try {
      await setDoc(doc(db, 'resultados', `${uid}_${fecha}`), resultado);
      const docRef = doc(db, 'usuarios', uid);
      await updateDoc(docRef, {
        ganados: acierto ? userWin + 1 : userWin,
        perdidos: !acierto ? userLose + 1 : userLose,
      });
    } catch (e) {
      console.error('Error al guardar resultado:', e);
    }
  };

  const getRandomArtist = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://itunes.apple.com/search?term=reggaeton&entity=musicTrack&limit=100');
      const json = await res.json();
      const canciones = json.results.filter(c => c.artistName && c.artworkUrl100);
      const aleatoria = canciones[Math.floor(Math.random() * canciones.length)];

      setArtistName(aleatoria.artistName.toUpperCase());
      setArtwork(aleatoria.artworkUrl100.replace('100x100', '600x600'));
      setTrackId(aleatoria.trackId);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener artista:', err);
    }
  };

  useEffect(() => {
    getRandomArtist();
  }, []);

  const handleLetterClick = async (letter) => {
    if (guessedLetters.includes(letter) || gameOver || gameWon) return;

    const updatedGuessed = [...guessedLetters, letter];
    setGuessedLetters(updatedGuessed);

    if (!artistName.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      if (newWrongGuesses >= MAX_ATTEMPTS) {
        setGameOver(true);
        setUserLose(userLose + 1);
        await guardarResultado(false);
      }
    } else {
      const allCorrect = artistName
        .split('')
        .every((l) => l === ' ' || updatedGuessed.includes(l));
      if (allCorrect) {
        setGameWon(true);
        setUserWin(userWin + 1);
        await guardarResultado(true);
      }
    }
  };

  const renderWord = () =>
    artistName.split('').map((letter, index) => (
      <Text key={index} style={styles.letter}>
        {guessedLetters.includes(letter) || gameOver || gameWon ? letter : '_'}
      </Text>
    ));

  const restartGame = () => {
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
    setGameWon(false);
    getRandomArtist();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎵 Adivina el Artista de Reguetón</Text>
      <Text style={styles.stats}>Ganados: {userWin} | Perdidos: {userLose}</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Image source={{ uri: artwork }} style={styles.image} />
          <View style={styles.wordContainer}>{renderWord()}</View>

          <View style={styles.keyboard}>
            {ALPHABET.map((letter) => (
              <TouchableOpacity
                key={letter}
                onPress={() => handleLetterClick(letter)}
                disabled={guessedLetters.includes(letter) || gameOver || gameWon}
                style={[styles.key, guessedLetters.includes(letter) && styles.keyDisabled]}
              >
                <Text>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.attempts}>
            Fallos: {wrongGuesses} / {MAX_ATTEMPTS}
          </Text>

          {gameOver && <Text style={styles.lost}>💀 ¡Perdiste! Era: {artistName}</Text>}
          {gameWon && <Text style={styles.won}>🎉 ¡Ganaste!</Text>}

          {(gameOver || gameWon) && (
            <TouchableOpacity style={styles.button} onPress={restartGame}>
              <Text style={styles.buttonText}>Jugar otra vez</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 22, marginBottom: 10 },
  image: { width: 200, height: 200, marginVertical: 10, borderRadius: 10 },
  stats: { marginBottom: 10, fontSize: 16 },
  wordContainer: { flexDirection: 'row', marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  letter: { fontSize: 28, marginHorizontal: 4 },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  key: {
    backgroundColor: '#eee',
    padding: 10,
    margin: 4,
    borderRadius: 4,
    width: 40,
    alignItems: 'center',
  },
  keyDisabled: {
    backgroundColor: '#ccc',
  },
  attempts: { fontSize: 16, marginBottom: 10 },
  lost: { color: 'red', fontSize: 18 },
  won: { color: 'green', fontSize: 18 },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0066cc',
    borderRadius: 5,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});