import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TextInput } from 'react-native';

export default function Home() {
  const [data, setData] = useState([]);
  const [busqueda, setBusqueda] = useState('bad bunny');

  useEffect(() => {
    const obtenerDatos = async () => {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(busqueda)}&limit=20`);
      const json = await res.json();
      setData(json.results);
    };
    obtenerDatos();
  }, [busqueda]);

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
            <Text>{item.trackName}</Text>
            <Text style={{ fontSize: 12, color: 'gray' }}>{item.artistName}</Text>
            <Image
              source={{ uri: item.artworkUrl100 }}
              style={styles.imagen}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'space-between',
    padding: 10,
  },
  item: {
    backgroundColor: 'aliceblue',
    width: '48%',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
  },
  imagen: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 5,
  },
  buscador: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
});