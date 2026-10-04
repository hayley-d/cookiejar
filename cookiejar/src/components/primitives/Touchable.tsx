import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type TouchableProperties = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

const pressedOpacity = 0.7;

export function Touchable({ style, disabled, ...pressableProperties }: TouchableProperties) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [style, { opacity: pressed || disabled ? pressedOpacity : 1 }]}
      {...pressableProperties}
    />
  );
}
