import React, {FC, useEffect, useRef, useState} from 'react';
import {Text, Animated, StyleProp, TextStyle} from 'react-native';

interface AnimatedNumberProps {
  value?: number;
  duration?: number;
  fixed?: number;
  style?: StyleProp<TextStyle>;
  format?: string;
}

const AnimatedNumber: FC<AnimatedNumberProps> = ({
  value = 0,
  duration = 1,
  fixed = 2,
  style,
  format = '%&%',
}) => {
  const DURATION_SECOND = duration * 1000;
  const [animatedNumber, setAnimatedNumber] = useState(0);
  const numAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      numAnim.addListener(({value}) => {
        const fixedValue = value.toFixed(fixed);
        setAnimatedNumber(Number(fixedValue));
      });
      startAnim();
    }
    return () => {
      numAnim.removeAllListeners();
      _mounted = false;
    };
  }, [value, duration, fixed, format]);

  const startAnim = () => {
    Animated.timing(numAnim, {
      toValue: value,
      duration: DURATION_SECOND,
      useNativeDriver: false,
    }).start();
  };

  const formattedText = format.replace('%&%', animatedNumber.toString());
  return <Text style={style}>{formattedText}</Text>;
};

export default AnimatedNumber;
