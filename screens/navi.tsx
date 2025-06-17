import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Category: undefined;
  Product: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Button
        title="Category"
        onPress={() => navigation.navigate('Category')}
      />
      <Button
        title="Product"
        onPress={() => navigation.navigate('Product')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
});

export default HomeScreen;