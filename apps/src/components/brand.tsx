import { Image, View } from "react-native";
export function BrandLogo() {
  return (
    <View style={{ alignItems: "center" }}>
      <Image
        source={require("../../../assets/eben_logo_full.png")}
        accessibilityLabel="Eben Institute"
        accessible
        resizeMode="contain"
        style={{ width: 150, height: 160 }}
      />
    </View>
  );
}
