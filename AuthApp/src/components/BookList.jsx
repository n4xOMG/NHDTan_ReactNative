import React from "react";
import { FlatList } from "react-native";
import BookItem from "./BookItem";
import EmptyState from "./EmptyState";
import { bookmanagestyles } from "../style/bookmanagestyles";

const BookList = ({ books, handleEdit, handleDelete }) => {
  return (
    <FlatList
      data={books}
      renderItem={({ item }) => <BookItem item={item} onEdit={handleEdit} onDelete={handleDelete} />}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={bookmanagestyles.listContainer}
      ListEmptyComponent={<EmptyState />}
    />
  );
};

export default BookList;
