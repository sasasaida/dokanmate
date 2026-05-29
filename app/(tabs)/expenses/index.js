import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../src/constants/colors";

export default function ExpensesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Expenses</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  text: { fontSize: 16, color: Colors.textSecondary },
});
