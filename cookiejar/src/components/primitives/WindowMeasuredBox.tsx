import { useRef } from 'react';
import { View, type ViewProps } from 'react-native';

export type WindowFrame = {
  top: number;
  height: number;
};

type WindowMeasuredBoxProperties = Omit<ViewProps, 'onLayout'> & {
  onMeasure: (windowFrame: WindowFrame) => void;
};

export function WindowMeasuredBox({ onMeasure, ...viewProperties }: WindowMeasuredBoxProperties) {
  const viewReference = useRef<View>(null);

  return (
    <View
      ref={viewReference}
      onLayout={() =>
        viewReference.current?.measureInWindow((left, top, width, height) => onMeasure({ top, height }))
      }
      {...viewProperties}
    />
  );
}
