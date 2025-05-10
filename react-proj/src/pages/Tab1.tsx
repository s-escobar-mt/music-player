import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';
import characterThemes from './Tab2';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Genshin Impact Music Player</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Genshin Impact Music Player</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton expand="block" href='/characters'>Character Themes</IonButton>
      </IonContent>
    </IonPage>
  );

};

export default Tab1;
