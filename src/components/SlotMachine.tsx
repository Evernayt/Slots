import {FC, useEffect, useState, useRef} from 'react';
import {View, StyleSheet, Animated, Easing, Image} from 'react-native';
import {SLOTS} from '../constants/app';
import {frame_1, frame_2, frame_3} from '../constants/images';
import {COLORS, SIZES} from '../constants/theme';
import shuffle from '../helpers/shuffle';
import Sound from 'react-native-sound';

interface SlotMachineProps {
  slotNum: string;
  forceUpdate: boolean;
  onFinished: () => void;
}

const WINDOW_HEIGHT = SIZES.width < SIZES.height ? SIZES.width : SIZES.height;
const ITERATIONS = 5;
const DURATION = 400;
const FRAME_HEIGHT = WINDOW_HEIGHT - 150;
const FRAME_SIDE_WIDTH = 0.6157 * FRAME_HEIGHT;
const FRAME_CENTER_WIDTH = 0.5714 * FRAME_HEIGHT;
const SLOT_HEIGHT = FRAME_HEIGHT / 3;
const MAX_SLOTS_INDEX = SLOTS.length - 1;

const SlotMachine: FC<SlotMachineProps> = ({
  slotNum = '',
  forceUpdate,
  onFinished,
}) => {
  const [values, setValues] = useState<Animated.Value[]>([]);

  const spinEndRef = useRef(new Sound('spin_end.mp3', Sound.MAIN_BUNDLE));

  useEffect(() => {
    if (!slotNum) return;
    const newValues = getAdjustedAnimationValues();
    setValues(newValues);
    startAnimation(newValues);
  }, [slotNum, forceUpdate]);

  const startAnimation = (newValues: Animated.Value[]) => {
    if (!newValues.length) return;
    const easing = Easing.inOut(Easing.ease);

    const index2 = MAX_SLOTS_INDEX - 1;
    const index3 = MAX_SLOTS_INDEX - 2;
    const animationValue1 = -1 * MAX_SLOTS_INDEX * SLOT_HEIGHT;
    const animationValue2 = -1 * index2 * SLOT_HEIGHT;
    const animationValue3 = -1 * index3 * SLOT_HEIGHT;

    const animationValues = shuffle([
      animationValue1,
      animationValue2,
      animationValue3,
    ]);

    Animated.loop(
      Animated.timing(newValues[0], {
        toValue: animationValues[0],
        useNativeDriver: false,
        easing,
        duration: DURATION,
      }),
      {iterations: ITERATIONS},
    ).start();

    Animated.loop(
      Animated.timing(newValues[1], {
        toValue: animationValues[1],
        useNativeDriver: false,
        easing,
        duration: DURATION,
      }),
      {iterations: ITERATIONS},
    ).start();

    Animated.loop(
      Animated.timing(newValues[2], {
        toValue: animationValues[2],
        useNativeDriver: false,
        easing,
        duration: DURATION,
      }),
      {iterations: ITERATIONS},
    ).start(event => {
      if (event.finished) {
        const nums = slotNum.split('');
        const animationValue1 = -1 * Number(nums[0]) * SLOT_HEIGHT;
        const animationValue2 = -1 * Number(nums[1]) * SLOT_HEIGHT;
        const animationValue3 = -1 * Number(nums[2]) * SLOT_HEIGHT;

        Animated.loop(
          Animated.timing(newValues[0], {
            toValue: animationValue1,
            useNativeDriver: false,
            easing,
            duration: 200,
          }),
          {iterations: 3},
        ).start(event => {
          if (event.finished) {
            spinEndRef.current.play();
          }
        });

        Animated.loop(
          Animated.timing(newValues[1], {
            toValue: animationValue2,
            useNativeDriver: false,
            easing,
            duration: 200,
          }),
          {iterations: 4},
        ).start(event => {
          if (event.finished) {
            spinEndRef.current.play();
          }
        });

        Animated.loop(
          Animated.timing(newValues[2], {
            toValue: animationValue3,
            useNativeDriver: false,
            easing,
            duration: 200,
          }),
          {iterations: 5},
        ).start(event => {
          if (event.finished) {
            onFinished();
            spinEndRef.current.play();
          }
        });
      }
    });
  };

  const getAdjustedAnimationValues = () => {
    let neededValues = slotNum.length - values.length;

    if (neededValues <= 0) {
      return values;
    }

    const defaultPosition = getPosition(0);
    const newValues = [...values];

    while (neededValues--) {
      newValues.unshift(new Animated.Value(defaultPosition));
    }

    return newValues;
  };

  const getPosition = (index: number) => {
    const position = -1 * index * SLOT_HEIGHT;
    return position;
  };

  const generateSlots = () => {
    const elements = slotNum.split('').map((_v, index) => renderSlot(index));
    return elements;
  };

  const renderContent = (currentChar: number) => {
    return (
      <Image
        source={SLOTS[currentChar].image}
        style={{height: '110%'}}
        resizeMode="contain"
      />
    );
  };

  const renderSlot = (position: number) => {
    const slots = SLOTS.map((_slot, i) => {
      const content = renderContent(i);
      const startContent = renderContent(0);
      const endContent = renderContent(MAX_SLOTS_INDEX);

      if (values.length) {
        if (i === MAX_SLOTS_INDEX) {
          return (
            <View key={i}>
              <Animated.View
                style={[
                  styles.slotInner,
                  {height: SLOT_HEIGHT},
                  {transform: [{translateY: values[position]}]},
                ]}>
                {content}
              </Animated.View>
              <Animated.View
                style={[
                  styles.slotInner,
                  {height: SLOT_HEIGHT},
                  {transform: [{translateY: values[position]}]},
                ]}>
                {startContent}
              </Animated.View>
            </View>
          );
        } else if (i === 0) {
          return (
            <View key={i}>
              <Animated.View
                style={[
                  styles.slotInner,
                  {height: SLOT_HEIGHT},
                  {transform: [{translateY: values[position]}]},
                ]}>
                {endContent}
              </Animated.View>
              <Animated.View
                style={[
                  styles.slotInner,
                  {height: SLOT_HEIGHT},
                  {transform: [{translateY: values[position]}]},
                ]}>
                {content}
              </Animated.View>
            </View>
          );
        } else {
          return (
            <Animated.View
              key={i}
              style={[
                styles.slotInner,
                {height: SLOT_HEIGHT},
                {transform: [{translateY: values[position]}]},
              ]}>
              {content}
            </Animated.View>
          );
        }
      }
    });

    let side = {};
    if (position === 0) {
      side = {right: FRAME_CENTER_WIDTH / 2};
    } else if (position === 2) {
      side = {left: FRAME_CENTER_WIDTH / 2};
    }

    return (
      <View
        key={position}
        style={[
          {
            height: FRAME_HEIGHT,
            width: FRAME_CENTER_WIDTH,
            position: 'absolute',
          },
          side,
        ]}>
        {slots}
      </View>
    );
  };

  const slots = generateSlots();

  return (
    <View style={styles.container}>
      <View style={styles.slotsBg} />
      <View style={styles.slotContainer}>
        <View style={[styles.topOverlap, {right: FRAME_CENTER_WIDTH / 2}]} />
        <View style={[styles.bottomOverlap, {right: FRAME_CENTER_WIDTH / 2}]} />
        <Image
          source={frame_1}
          resizeMode="contain"
          style={[styles.sideFrame, {right: FRAME_CENTER_WIDTH / 2 - 1}]}
        />
        {slots[0]}
      </View>

      <View style={styles.slotContainer}>
        <View style={styles.topOverlap} />
        <View style={styles.bottomOverlap} />
        <Image
          source={frame_2}
          resizeMode="contain"
          style={styles.centerFrame}
        />
        {slots[1]}
      </View>

      <View style={styles.slotContainer}>
        <View style={[styles.topOverlap, {left: FRAME_CENTER_WIDTH / 2}]} />
        <View style={[styles.bottomOverlap, {left: FRAME_CENTER_WIDTH / 2}]} />
        <Image
          source={frame_3}
          resizeMode="contain"
          style={[styles.sideFrame, {left: FRAME_CENTER_WIDTH / 2 - 1}]}
        />
        {slots[2]}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotsBg: {
    backgroundColor: '#3e1942',
    position: 'absolute',
    width: FRAME_SIDE_WIDTH * 2 + FRAME_CENTER_WIDTH - 15,
    height: FRAME_HEIGHT - 15,
  },
  slotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topOverlap: {
    position: 'absolute',
    height: SIZES.height - FRAME_HEIGHT - 150 / 2,
    width: FRAME_SIDE_WIDTH,
    backgroundColor: COLORS.background,
    bottom: FRAME_HEIGHT / 2,
    zIndex: 2,
  },
  bottomOverlap: {
    position: 'absolute',
    height: SIZES.height - FRAME_HEIGHT - 150 / 2,
    width: FRAME_SIDE_WIDTH,
    backgroundColor: COLORS.background,
    top: FRAME_HEIGHT / 2,
    zIndex: 2,
  },
  slotInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideFrame: {
    height: FRAME_HEIGHT,
    width: FRAME_SIDE_WIDTH,
    position: 'absolute',
    zIndex: 3,
  },
  centerFrame: {
    height: FRAME_HEIGHT,
    width: FRAME_CENTER_WIDTH,
    position: 'absolute',
    zIndex: 3,
  },
});

export default SlotMachine;
