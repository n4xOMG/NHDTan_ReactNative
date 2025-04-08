import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Color palette
export const colors = {
  primary: "#3498db",
  secondary: "#2ecc71",
  accent: "#f39c12",
  dark: "#34495e",
  light: "#ecf0f1",
  white: "#ffffff",
  lightGray: "#f5f5f5",
  mediumGray: "#bdc3c7",
  darkGray: "#7f8c8d",
  black: "#2c3e50",
  error: "#e74c3c",
  text: {
    primary: "#2c3e50",
    secondary: "#7f8c8d",
    light: "#ecf0f1",
  },
  background: {
    primary: "#ffffff",
    secondary: "#f9f9f9",
  },
};

// Consistent spacing
const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

// Typography
const typography = {
  h1: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: spacing.m,
    color: colors.text.primary,
  },
  h2: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: spacing.s,
    color: colors.text.primary,
  },
  h3: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.s,
    color: colors.text.primary,
  },
  body: {
    fontSize: 16,
    color: colors.text.primary,
  },
  caption: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  small: {
    fontSize: 12,
    color: colors.text.secondary,
  },
};

// Shadow for cards and elements
const shadow = {
  small: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const modernStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    paddingBottom: spacing.m,
  },
  sectionContainer: {
    marginVertical: spacing.m,
    paddingHorizontal: spacing.m,
  },

  // Card and item styles
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadow.small,
  },
  bookItem: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    ...shadow.small,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  bookDetails: {
    flex: 1,
    marginLeft: spacing.m,
    justifyContent: "space-between",
  },

  // Text styles
  title: typography.h2,
  subtitle: typography.h3,
  sectionTitle: {
    ...typography.h2,
    marginHorizontal: spacing.m,
    marginVertical: spacing.m,
  },
  bodyText: typography.body,
  captionText: typography.caption,
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },

  // Button styles
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },

  // Navigation styles
  navigationBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    ...shadow.small,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    ...shadow.small,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginHorizontal: spacing.m,
  },

  // Category styles
  categoriesList: {
    paddingVertical: spacing.m,
  },
  categoryItem: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginRight: spacing.m,
    ...shadow.small,
  },
  categoryText: {
    color: colors.white,
    fontWeight: "600",
  },
  activeCategory: {
    backgroundColor: colors.secondary,
  },

  // Slideshow styles
  slideshow: {
    height: 200,
    marginBottom: spacing.m,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: spacing.m,
    ...shadow.medium,
  },
  slide: {
    width: width - spacing.m * 2,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  slideImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  slideTitleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: spacing.m,
  },
  slideTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  // Top liked books styles
  topLikedContainer: {
    marginTop: spacing.m,
  },
  topLikedBook: {
    width: 140,
    marginRight: spacing.m,
    ...shadow.small,
  },
  topLikedCover: {
    width: 140,
    height: 200,
    borderRadius: 8,
  },
  topLikedTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: spacing.s,
    color: colors.text.primary,
  },
  topLikedAuthor: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Utility styles
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    paddingVertical: spacing.l,
    alignItems: "center",
  },

  // Add booksContainer style
  booksContainer: {
    marginTop: spacing.s,
    marginBottom: spacing.m,
  },

  // Book item styles
  bookTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: spacing.s,
    color: colors.text.primary,
    maxWidth: 120,
  },
  bookAuthor: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  emptyText: {
    color: colors.text.secondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    color: colors.text.secondary,
    textAlign: "center",
    paddingVertical: spacing.m,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    paddingVertical: spacing.m,
  },
});
