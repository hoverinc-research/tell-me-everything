import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  /** Called with the local file URI of each captured photo. */
  onCapture: (uri: string) => void;
  /** Rendered under the shutter button, e.g. an upload queue. */
  footer?: React.ReactNode;
};

/**
 * Shared camera screen used by every capture flow. The native preview view is
 * not part of this repo, so `takePicture` returns a placeholder URI.
 */
export function CameraScreen({ onCapture, footer }: Props) {
  const takePicture = () => {
    onCapture(`file:///captures/${Date.now()}.jpg`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.preview} />
      <Pressable accessibilityRole="button" accessibilityLabel="Take photo" onPress={takePicture} style={styles.shutter}>
        <Text style={styles.shutterLabel}>Capture</Text>
      </Pressable>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: { flex: 1, backgroundColor: 'black' },
  shutter: { alignSelf: 'center', margin: 16, padding: 16, borderRadius: 32, backgroundColor: 'white' },
  shutterLabel: { fontWeight: '600' },
});
