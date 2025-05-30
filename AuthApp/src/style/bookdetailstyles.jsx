import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
export const bookdetailstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContentContainer: {
    paddingBottom: 30,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  topBar: {
    backgroundColor: "#2c3e50",
    paddingTop: Platform.OS === "ios" ? 0 : 10,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  backText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  loadingContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 10,
    color: "#e74c3c",
    fontSize: 14,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    height: width * 0.4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  details: {
    flex: 1,
    marginLeft: 16,
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
    lineHeight: 24,
    flexShrink: 1,
  },
  author: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
    flexShrink: 1,
  },
  category: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  descriptionContainer: {
    marginTop: 4,
    marginRight: 28, // Make room for favorite button
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 6,
    alignSelf: "flex-start",
  },
  readMoreText: {
    color: "#3498db",
    fontWeight: "600",
  },
  favoriteButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 6,
  },
  progressBar: {
    width: "100%",
    marginTop: 6,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 6,
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  chapterListContainer: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  commentSection: {
    marginTop: 5,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 10,
  },
  comment: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 5,
  },
  noComments: {
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
    padding: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxHeight: 100,
    textAlignVertical: "top", // Ensure text starts at the top for multiline
  },
  postButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  postButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  loginPrompt: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 15,
  },
});
