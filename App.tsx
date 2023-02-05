import {useEffect, useState} from 'react';
import remoteConfig from '@react-native-firebase/remote-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {FIREBASE_URL_KEY} from './src/constants/storage';
import SplashScreen from 'react-native-splash-screen';
import {View} from 'react-native';
import {DEF_URL} from './src/constants/app';
import Slots from './src/screens/Slots';
import {WebComponent} from './src/components';
import Orientation from 'react-native-orientation-locker';

const App = () => {
  const [url, setUrl] = useState<string>(DEF_URL);

  useEffect(() => {
    AsyncStorage.getItem(FIREBASE_URL_KEY).then(path => {
      remoteConfig()
        .fetchAndActivate()
        .then(() => loadFire(path));
    });
  }, []);

  useEffect(() => {
    if (url !== DEF_URL) {
      SplashScreen.hide();
    }
  }, [url]);

  const loadFire = (path: string | null) => {
    if (path) {
      setUrl(path);
    } else {
      const url = remoteConfig().getValue('url').asString();
      DeviceInfo.isEmulator().then(isEmulator => {
        if (!url || isEmulator) {
          setUrl('');
        } else {
          setUrl(url);
          AsyncStorage.setItem(FIREBASE_URL_KEY, url);
        }
      });
    }
  };

  const renderByUrl = () => {
    if (url === DEF_URL) {
      return null;
    } else if (url) {
      return <WebComponent url={url} disableGoBack />;
    } else {
      Orientation.lockToLandscape();
      return <Slots />;
    }
  };

  return <View style={{flex: 1}}>{renderByUrl()}</View>;
};

export default App;
