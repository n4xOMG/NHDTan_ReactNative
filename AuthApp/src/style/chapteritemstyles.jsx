import { StyleSheet } from "react-native";

export const chapteritemstyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chapterList: {
    flex: 1,
  },
  chapterItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  chapterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chapterTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    marginRight: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
});
