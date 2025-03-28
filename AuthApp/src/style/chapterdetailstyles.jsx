import { Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window");

export const chapterdetailstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    backgroundColor: "#2196F3",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "white",
    marginLeft: 5,
    fontSize: 16,
  },
  topBarTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  // Floating navbar styles
  floatingNavbar: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  navProgressContainer: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    marginBottom: 5,
  },
  navProgressBar: {
    height: "100%",
    backgroundColor: "#2196F3",
  },
  navIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
});
