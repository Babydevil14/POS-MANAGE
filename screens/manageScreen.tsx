import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ManageScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MANAGE PRODUCT</Text>
      <View style={styles.buttonWrapper}>
        <Button
          title="Go to Category"
          onPress={() => navigation.navigate("CategoriesScreen")}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <Button
          title="Go to Product"
          onPress={() => navigation.navigate("ProductScreen")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonWrapper: {
    marginVertical: 8,
    width: 200,
  },
});