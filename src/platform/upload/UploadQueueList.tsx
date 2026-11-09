import React from 'react';
import { Button, FlatList, Image, Text, View } from 'react-native';
import type { UploadItem } from './types';

type Props = {
  items: UploadItem[];
  onRetry: (id: string) => void;
};

export function UploadQueueList({ items, onRetry }: Props) {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
          <Image source={{ uri: item.uri }} style={{ width: 48, height: 48, borderRadius: 4 }} />
          <Text style={{ flex: 1, marginLeft: 8 }}>
            {item.status === 'failed' ? 'Failed' : `${Math.round(item.progress * 100)}%`}
          </Text>
          {item.status === 'failed' && <Button title="Retry" onPress={() => onRetry(item.id)} />}
        </View>
      )}
    />
  );
}
