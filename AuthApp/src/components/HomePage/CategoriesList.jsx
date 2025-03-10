import { Text, View } from "react-native";
import { styles } from "../../style/styles";

export const CategoriesList = () => {
  return (
    <View style={[styles.section, styles.categories]}>
      <Text style={styles.text}>Categories</Text>
    </View>
  );
};
