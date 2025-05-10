import React, { useState, useEffect, useRef } from 'react';
import { add, trash, arrowBack, ellipsisHorizontal, play, pause } from 'ionicons/icons';
import {
  IonContent, IonCard, IonCardHeader, IonCardContent,
  IonImg, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons,
  IonButton, IonIcon, IonBackButton, IonFooter
} from '@ionic/react';
import './Tab2.css';

interface CharacterData {
  id: number;
  chara: string;
  musicFile: string;
  title: string;
  credits: string;
  img: string;
}

const CharacterThemes: React.FC = () => {
  const [charaCard, setCharacters] = useState<CharacterData[]>([]);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [audioMap, setAudioMap] = useState<Map<string, HTMLAudioElement>>(new Map());
  const [isPlayingMap, setIsPlayingMap] = useState<Record<string, boolean>>({});
  const [nextSong, setNextSong] = useState<string | null>(null);
  const [prevSong, setPrevSong] = useState<string | null>(null);
  const playlistRef = useRef<string[]>([]);

  const BASE_AUDIO_URL = 'https://s-escobar-mt.github.io/s-escobar-mt.github.io-genshin-music-api/audio/';
  const BASE_IMAGE_URL = 'https://s-escobar-mt.github.io/s-escobar-mt.github.io-genshin-music-api/images/';

  useEffect(() => {
    fetch('https://s-escobar-mt.github.io/s-escobar-mt.github.io-genshin-music-api/data.json')
      .then((response) => response.json())
      .then((data) => setCharacters(data))
      .catch((error) => console.error('Error loading character themes:', error));
  }, []);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  const playSong = (songPath: string) => {
    // Pause the previous song if there's one playing
    if (playlist[0]) {
      const previousAudio = audioMap.get(playlist[0]);
      if (previousAudio) {
        previousAudio.pause();
        previousAudio.currentTime = 0;
        setIsPlayingMap(prev => ({ ...prev, [playlist[0]]: false }));
      }
    }

    let audio = audioMap.get(songPath);
    if (!audio) {
      audio = new Audio(songPath);
      setAudioMap(prev => new Map(prev).set(songPath, audio));
    }

    audio.play();
    setIsPlayingMap(prev => ({ ...prev, [songPath]: true }));

    if (playlist.length > 1) {
      setNextSong(playlist[1]);
    }

    audio.onended = () => {
      pauseSong(songPath);
      setPrevSong(playlist[0]);
      const updatedPlaylist = [...playlistRef.current];
      updatedPlaylist.shift();
      setPlaylist(updatedPlaylist);

      if (updatedPlaylist.length > 0) {
        playSong(updatedPlaylist[0]);
      }
    };
  };

  const pauseSong = (songPath: string) => {
    const audio = audioMap.get(songPath);
    if (audio) {
      audio.pause();
      setIsPlayingMap(prev => ({ ...prev, [songPath]: false }));
    }
  };

  const togglePlayPause = (songPath: string) => {
    const isCurrent = playlist[0] === songPath;
    const isPlaying = isPlayingMap[songPath];

    if (isCurrent && isPlaying) {
      pauseSong(songPath);
    } else {
      pauseSong(playlist[0]);
      const updatedPlaylist = [...playlistRef.current];
      const existingIndex = updatedPlaylist.indexOf(songPath);
      if (existingIndex !== -1) updatedPlaylist.splice(existingIndex, 1);
      updatedPlaylist.unshift(songPath);
      setPlaylist(updatedPlaylist);
      playSong(songPath);
    }
  };

  const addToPlaylist = (songPath: string) => {
    if (!playlist.includes(songPath)) {
      const newPlaylist = [...playlist, songPath];
      setPlaylist(newPlaylist);
      if (newPlaylist.length === 1) playSong(newPlaylist[0]);
      if (newPlaylist.length > 1) setNextSong(newPlaylist[1]);
    }
  };

  const removeFromPlaylist = (songPath: string) => {
    const updated = [...playlistRef.current];
    const index = updated.indexOf(songPath);
    if (index !== -1) {
      updated.splice(index, 1);
      setPlaylist(updated);

      // If the song removed is currently playing, stop it and play the next song
      if (playlist[0] === songPath) {
        const nextSong = updated[0]; // Get the new current song
        setIsPlayingMap(prev => ({ ...prev, [songPath]: false }));
        const audio = audioMap.get(songPath);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        if (nextSong) {
          playSong(nextSong);
        }
      }
    }
  };

  const skipToNextSong = () => {
    if (playlist.length > 1 && nextSong) {
      setPrevSong(playlist[0]);
      playSong(nextSong);
    }
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" icon={arrowBack} />
          </IonButtons>
          <IonTitle>Character Themes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {charaCard.map(character => {
          const songPath = `${BASE_AUDIO_URL}${character.musicFile}`;
          const imageUrl = `${BASE_IMAGE_URL}${character.img}`;
          const inPlaylist = playlist.includes(songPath);
          return (
            <IonCard key={character.id}>
              <IonCardHeader>
                <h2>{character.title}</h2>
              </IonCardHeader>
              <IonCardContent>
                <IonImg src={imageUrl} alt={character.chara} style={{ width: '150px', height: 'auto' }} />
                <p>Credits: {character.credits}</p>
                <IonButtons>
                  <IonButton size="small" color="light" onClick={() => togglePlayPause(songPath)}>
                    <IonIcon icon={playlist[0] === songPath && isPlayingMap[songPath] ? pause : play} color="dark" />
                  </IonButton>
                  <IonButton onClick={() => inPlaylist ? removeFromPlaylist(songPath) : addToPlaylist(songPath)}>
                    <IonIcon icon={inPlaylist ? trash : add} />
                  </IonButton>
                </IonButtons>
              </IonCardContent>
            </IonCard>
          );
        })}
        <IonFooter>
          {playlist.length > 0 && (
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(35, 14, 157, 0.9)',
              padding: '10px 20px',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div>
                <strong>Now Playing:</strong>{' '}
                {charaCard.find(c => `${BASE_AUDIO_URL}${c.musicFile}` === playlist[0])?.title || 'Unknown'}
                <br />
                <strong>Next:</strong>{' '}
                {playlist.length > 1
                  ? charaCard.find(c => `${BASE_AUDIO_URL}${c.musicFile}` === playlist[1])?.title || 'Unknown'
                  : 'None'}
              </div>
              {playlist.length > 1 && (
                <IonButton color="light" onClick={skipToNextSong}>
                  Skip
                </IonButton>
              )}
            </div>
          )}
        </IonFooter>

      </IonContent>
    </IonPage>
  );
};

export default CharacterThemes;
