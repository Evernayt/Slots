import {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TextInput} from 'react-native';
import {AnimatedNumber, Button, SlotMachine} from '../components';
import {COLORS} from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COINS_KEY} from '../constants/storage';
import Sound from 'react-native-sound';
import {SLOTS} from '../constants/app';
import getRandomNum from '../helpers/getRandomNum';

const generateSlotNum = (min: number, max: number) => {
  const num1 = getRandomNum(min, max);
  const num2 = getRandomNum(min, max);
  const num3 = getRandomNum(min, max);
  return `${num1}${num2}${num3}`;
};

const DEFAULT_COINS = 10000;
const DEFAULT_BET = 100;
const MAX_DEFEAT = 15;
const MAX_SLOTS_INDEX = SLOTS.length - 1;

const Slots = () => {
  const [slotNum, setSlotNum] = useState<string>('');
  const [coins, setCoins] = useState<number>(DEFAULT_COINS);
  const [bet, setBet] = useState<number>(
    coins < DEFAULT_BET ? coins : DEFAULT_BET,
  );
  const [spinDisabled, setSpinDisabled] = useState<boolean>(false);
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);
  const [numDuration, setNumDuration] = useState<number>(0.5);
  const [isStart, setIsStart] = useState<boolean>(true);
  const [defeatCount, setDefeatCount] = useState<number>(0);

  const spinStartRef = useRef(new Sound('spin_start.wav', Sound.MAIN_BUNDLE));
  const spinRef = useRef(new Sound('spin.mp3', Sound.MAIN_BUNDLE));

  const wonRef = useRef(new Sound('won.wav', Sound.MAIN_BUNDLE));

  useEffect(() => {
    AsyncStorage.getItem(COINS_KEY).then(data => {
      if (data) {
        setCoins(Number(data));
      }
    });
  }, []);

  const newGame = () => {
    try {
      AsyncStorage.setItem(COINS_KEY, DEFAULT_COINS.toString());
    } catch {}

    setCoins(DEFAULT_COINS);
    setBet(DEFAULT_BET);
    setSpinDisabled(false);
  };

  const checkWin = () => {
    const nums = slotNum.split('');
    return nums.every(match => match === nums[0]);
  };

  const spin = () => {
    setIsStart(false);
    setNumDuration(0.5);
    spinStartRef.current.play();
    spinRef.current.play();

    setSpinDisabled(true);

    const minusCoins = coins - bet;
    try {
      AsyncStorage.setItem(COINS_KEY, minusCoins.toString());
    } catch {}

    setCoins(minusCoins);
    setBet(prevState => (minusCoins < prevState ? minusCoins : prevState));

    if (defeatCount === MAX_DEFEAT) {
      const num = getRandomNum(0, MAX_SLOTS_INDEX);
      setSlotNum(`${num}${num}${num}`);
      setDefeatCount(0);
    } else {
      const num = generateSlotNum(0, MAX_SLOTS_INDEX);
      setSlotNum(num);
    }
    setForceUpdate(prevState => !prevState);
  };

  const spinFinishedHandler = () => {
    spinRef.current.stop();
    setSpinDisabled(false);

    if (checkWin()) {
      const wonCoins = bet * 15;
      try {
        AsyncStorage.setItem(COINS_KEY, (coins + wonCoins).toString());
      } catch {}
      setCoins(prevState => prevState + wonCoins);
      setNumDuration(3);
      wonRef.current.play();
    } else {
      setDefeatCount(prevState => prevState + 1);
    }
  };

  return (
    <View style={styles.container}>
      {isStart && (
        <Text style={styles.start}>Press SPIN to start the game</Text>
      )}
      <View style={styles.header}>
        <AnimatedNumber
          value={coins}
          style={styles.title}
          duration={numDuration}
          fixed={0}
          format={'COINS: %&%'}
        />
        <Text style={[styles.title, {marginLeft: 24, marginRight: 2}]}>
          BET:
        </Text>
        <TextInput
          value={bet.toString()}
          style={[styles.title, {paddingBottom: 10}]}
          inputMode="numeric"
          editable={!spinDisabled}
          onChangeText={text => {
            const num = Number(text);
            if (num < 1 || num > coins) {
              return;
            }
            setBet(num);
          }}
        />
      </View>
      <SlotMachine
        slotNum={slotNum}
        forceUpdate={forceUpdate}
        onFinished={spinFinishedHandler}
      />
      <View style={styles.footer}>
        <Button
          text="NEW GAME"
          disabled={
            spinDisabled || (coins === DEFAULT_COINS && bet === DEFAULT_BET)
          }
          onPress={newGame}
        />
        <Button
          text="SPIN"
          containerStyle={{marginHorizontal: 12}}
          disabled={spinDisabled || coins < 1}
          onPress={spin}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  start: {
    position: 'absolute',
    color: 'white',
    zIndex: 5,
    fontSize: 24,
  },
  header: {
    position: 'absolute',
    top: 10,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    display: 'flex',
    flexDirection: 'row',
  },
});

export default Slots;
