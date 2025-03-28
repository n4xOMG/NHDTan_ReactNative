import { StyleSheet } from "react-native";

export const commentstyles = StyleSheet.create({
  commentContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commentUser: {
    fontWeight: "600",
    marginBottom: 5,
  },
  commentContent: {
    fontSize: 15,
    color: "#333",
  },
  replyButton: {
    color: "#3498db",
    marginTop: 5,
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 5,
    marginRight: 10,
  },
  replySubmit: {
    backgroundColor: "#3498db",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  replySubmitText: {
    color: "#fff",
  },
  repliesContainer: {
    marginLeft: 20,
    marginTop: 10,
  },
  loadMoreButton: {
    alignItems: "center",
    marginVertical: 10,
  },
  loadMoreText: {
    color: "#3498db",
    fontSize: 16,
  },
});
