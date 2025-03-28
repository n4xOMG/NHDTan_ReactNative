import { StyleSheet } from "react-native";

export const commentstyles = StyleSheet.create({
  commentContainer: {
    borderBottomWidth: 0, // Remove bottom border for modern card look
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentUser: {
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
  },
  commentContent: {
    fontSize: 15,
    color: "#555",
    lineHeight: 20,
  },
  replyButton: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "500",
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 5,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  replySubmit: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  replySubmitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  repliesContainer: {
    marginLeft: 20,
    marginTop: 10,
  },
  loadMoreButton: {
    alignItems: "center",
    marginVertical: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3498db",
  },
  loadMoreText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "500",
  },
});
