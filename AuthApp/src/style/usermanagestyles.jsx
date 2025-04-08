import { StyleSheet } from "react-native";

export const usermanagestyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  titleContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  statItem: {
    marginRight: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a80f5",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: "#ffffff",
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterGroup: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: "#4a80f5",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 15,
    color: "#666",
    marginRight: 8,
  },
  sortButton: {
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeSortButton: {
    backgroundColor: "#4a80f5",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#666",
  },
  activeSortText: {
    color: "#fff",
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  userItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  userDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  joinDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  actionButtons: {
    justifyContent: "space-around",
    alignItems: "center",
    padding: 8,
  },
  statusSwitch: {
    marginBottom: 16,
  },
  editButton: {
    marginBottom: 16,
  },
  deleteButton: {
    marginBottom: 8,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4a80f5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  userAvatarContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  modalUserAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#4a80f5",
  },
  avatarEditButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#4a80f5",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  radioGroup: {
    flexDirection: "row",
    marginTop: 4,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4a80f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#4a80f5",
  },
  radioLabel: {
    fontSize: 16,
    color: "#555",
  },
  statusToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#4a80f5",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#555",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  verifiedText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#4a80f5",
  },
  banReason: {
    fontSize: 12,
    color: "#cc0000",
    fontStyle: "italic",
    marginTop: 4,
  },
});
