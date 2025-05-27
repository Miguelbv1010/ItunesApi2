import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TextInput, Button } from 'react-native';
import { Audio } from 'expo-av';

export default function Home() {
  const [data, setData] = useState([]);
  const [busqueda, setBusqueda] = useState('Feid');
  const [sound, setSound] = useState(null);
  const [estaSonando, setEstaSonando] = useState(false);

  const obtenerDatos = async () => {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(busqueda)}&entity=musicTrack&limit=20`);
    const json = await res.json();
    const filtrados = json.results.filter(item => item.previewUrl);
    setData(filtrados);
  };

  useEffect(() => {
    obtenerDatos();
  }, [busqueda]);

  const reproducir = async (url) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );

      setSound(newSound);
      setEstaSonando(true);
    } catch (e) {
      console.log('Error al reproducir:', e);
    }
  };

  const detener = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setEstaSonando(false);
      }
    } catch (e) {
      console.log('Error al detener:', e);
    }
  };

  return (
    <ScrollView>
      <TextInput
        style={styles.buscador}
        placeholder="Buscar artista o canción"
        value={busqueda}
        onChangeText={setBusqueda}
      />
      <View style={styles.lista}>
        {data.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.nombre}>{item.trackName}</Text>
            <Text style={styles.artista}>{item.artistName}</Text>
            <Image source={{ uri: item.artworkUrl100 }} style={styles.imagen} />
            <Button title="▶ Reproducir" onPress={() => reproducir(item.previewUrl)} />
            {estaSonando && <Button title="⏸ Detener" onPress={detener} color="red" />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buscador: {
    marginTop: 30,
    marginHorizontal: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 5,
    padding: 10,
  },
  item: {
    backgroundColor: '#f0f8ff',
    width: '48%',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
  },
  imagen: {
    width: 100,
    height: 100,
    marginVertical: 10,
    resizeMode: 'contain',
  },
  nombre: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  artista: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
});
