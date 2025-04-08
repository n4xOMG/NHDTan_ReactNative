import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { getTopCategories } from "../../services/CategoryServices";
import { modernStyles } from "../../style/modernStyles";
import { BookItem } from "./BookItem";

export const CategoriesList = () => {
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoryData = await getTopCategories();
        // Add "All" category if needed
        setCategories([{ id: 0, name: "All", books: categoryData.flatMap((cat) => cat.books || []) }, ...categoryData]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryPress = (categoryName) => {
    setActiveCategory(categoryName);
  };

  // Get active category books
  const getActiveCategoryBooks = () => {
    const activeData = categories.find((cat) => cat.name === activeCategory);
    return activeData?.books || [];
  };

  return (
    <View style={modernStyles.sectionContainer}>
      <Text style={modernStyles.sectionTitle}>Categories</Text>

      {loading ? (
        <Text style={modernStyles.loadingText}>Loading categories...</Text>
      ) : error ? (
        <Text style={modernStyles.errorText}>{error}</Text>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={modernStyles.categoriesList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[modernStyles.categoryItem, activeCategory === category.name ? modernStyles.activeCategory : null]}
                onPress={() => handleCategoryPress(category.name)}
              >
                <Text style={modernStyles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={modernStyles.booksContainer}>
            <FlatList
              data={getActiveCategoryBooks()}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <BookItem book={item} />}
              ListEmptyComponent={<Text style={modernStyles.emptyText}>No books found in this category</Text>}
            />
          </View>
        </>
      )}
    </View>
  );
};
