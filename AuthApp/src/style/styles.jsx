import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  topBarTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  userIconContainer: {
    padding: 5,
  },
  topBar: {
    height: 60,
    backgroundColor: "#2c3e50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdownMenu: {
    position: "absolute", // Use absolute positioning
    top: 60, // Align below the top bar (height: 60)
    right: 10, // Align to the right with some padding
    backgroundColor: "white",
    borderRadius: 8,
    width: 150, // Fixed width
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  section: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 10,
  },
  slideshow: {
    height: 200,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  slideImage: {
    width: width * 0.9,
    height: 200,
    borderRadius: 10,
  },
  categories: {
    height: 100,
    backgroundColor: "#ecf0f1",
  },
  topBooks: {
    height: 220,
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
  },
  topBooksList: {
    paddingHorizontal: 10,
  },
  topBookItem: {
    width: 120,
    marginRight: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  topBookImage: {
    width: 100,
    height: 120,
    borderRadius: 5,
    alignSelf: "center",
  },
  topBookDetails: {
    marginTop: 5,
  },
  topBookTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  topBookAuthor: {
    fontSize: 12,
    color: "#666",
  },
  topBookRating: {
    fontSize: 12,
    color: "#e74c3c",
    fontWeight: "bold",
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bookImage: {
    width: 50,
    height: 70,
    marginRight: 10,
    borderRadius: 5,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  navBar: {
    height: 50,
    backgroundColor: "#2c3e50",
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noDataText: {
    color: "white",
    fontSize: 14,
  },
});
