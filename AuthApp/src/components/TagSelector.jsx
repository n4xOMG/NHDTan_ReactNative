import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { colors } from "../style/modernStyles";

const TagSelector = ({ selectedTags = [], availableTags = [], onTagsChange, error }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

  const handleTagToggle = (tagId) => {
    const isSelected = selectedTags.includes(tagId);
    let newSelectedTags;

    if (isSelected) {
      // Remove tag if already selected
      newSelectedTags = selectedTags.filter((id) => id !== tagId);
    } else {
      // Add tag if not selected
      newSelectedTags = [...selectedTags, tagId];
    }

    onTagsChange(newSelectedTags);
  };

  const getTagById = (tagId) => {
    return availableTags.find((tag) => tag.id === tagId);
  };

  // Filter tags based on search query
  const filteredTags = useCallback(() => {
    if (!searchQuery.trim()) {
      return availableTags;
    }

    return availableTags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [availableTags, searchQuery]);

  const selectedTagObjects = selectedTags.map((id) => getTagById(id)).filter(Boolean);

  // Determine which tags to display in the horizontal scroll
  const displayedTags = showAllTags ? filteredTags() : filteredTags().slice(0, 10);

  return (
    <View style={styles.container}>
      {/* Search input */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Popular/trending tags section */}
      <View style={styles.popularTagsSection}>
        <Text style={styles.sectionTitle}>Popular Tags</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScrollContainer}>
          {displayedTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                style={[styles.tag, isSelected ? styles.selectedTag : styles.unselectedTag]}
                onPress={() => handleTagToggle(tag.id)}
              >
                <Text style={[styles.tagText, isSelected ? styles.selectedTagText : styles.unselectedTagText]}>{tag.name}</Text>
                {isSelected && <Icon name="checkmark-circle" size={16} color="#fff" style={styles.tagIcon} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredTags().length > 10 && (
          <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAllTags(!showAllTags)}>
            <Text style={styles.showMoreText}>{showAllTags ? "Show fewer tags" : "Show all tags"}</Text>
            <Icon name={showAllTags ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected tags section */}
      <View style={styles.selectedTagsSection}>
        <Text style={styles.sectionTitle}>
          Selected Tags <Text style={styles.tagCount}>({selectedTagObjects.length})</Text>
        </Text>

        {selectedTagObjects.length === 0 ? (
          <Text style={styles.noTagsText}>No tags selected yet</Text>
        ) : (
          <View style={styles.selectedTagsList}>
            {selectedTagObjects.map((tag) => (
              <View key={tag.id} style={styles.selectedTagItem}>
                <Text style={styles.selectedTagItemText}>{tag.name}</Text>
                <TouchableOpacity style={styles.removeTagButton} onPress={() => handleTagToggle(tag.id)}>
                  <Icon name="close-circle" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  popularTagsSection: {
    marginBottom: 16,
  },
  selectedTagsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: colors.text.primary,
  },
  tagCount: {
    color: colors.text.secondary,
    fontWeight: "normal",
  },
  tagsScrollContainer: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: colors.primary,
  },
  unselectedTag: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedTagText: {
    color: "#fff",
  },
  unselectedTagText: {
    color: colors.text.primary,
  },
  tagIcon: {
    marginLeft: 4,
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 6,
  },
  showMoreText: {
    color: colors.primary,
    marginRight: 4,
    fontWeight: "500",
  },
  noTagsText: {
    color: colors.text.secondary,
    fontStyle: "italic",
    marginVertical: 8,
  },
  selectedTagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedTagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedTagItemText: {
    fontSize: 14,
    color: colors.text.primary,
    marginRight: 4,
  },
  removeTagButton: {
    marginLeft: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});

export default TagSelector;
