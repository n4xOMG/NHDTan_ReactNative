import { Text, View } from "react-native";
import { styles } from "../../style/styles";

export const NavigationBar = () => {
  return (
    <View style={[styles.section, styles.navBar]}>
      <Text style={styles.text}>Navigation</Text>
    </View>
  );
};
