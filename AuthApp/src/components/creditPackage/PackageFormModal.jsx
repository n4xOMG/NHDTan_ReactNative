import React from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, Switch } from "react-native";
import { creditmanagestyles } from "../../style/creditmanagestyles";

const PackageFormModal = ({
  visible,
  onClose,
  onSave,
  currentPackage,
  packageName,
  setPackageName,
  packageCredits,
  setPackageCredits,
  packagePrice,
  setPackagePrice,
  packageDescription,
  setPackageDescription,
  packageDuration,
  setPackageDuration,
  packageIcon,
  setPackageIcon,
  packageIsPopular,
  setPackageIsPopular,
  packageIsActive,
  setPackageIsActive,
  iconOptions,
}) => {
  const renderIconSelector = () => (
    <View style={creditmanagestyles.iconSelectorContainer}>
      {iconOptions.map((icon, index) => (
        <TouchableOpacity
          key={index}
          style={[creditmanagestyles.iconOption, packageIcon === icon && creditmanagestyles.selectedIconOption]}
          onPress={() => setPackageIcon(icon)}
        >
          <Text style={creditmanagestyles.iconText}>{icon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={creditmanagestyles.modalContainer}>
        <View style={creditmanagestyles.modalContent}>
          <Text style={creditmanagestyles.modalTitle}>{currentPackage ? "Edit Package" : "Add New Package"}</Text>

          <View style={creditmanagestyles.packageIconSelector}>
            <Text style={creditmanagestyles.inputLabel}>Select Icon</Text>
            {renderIconSelector()}
          </View>

          <View style={creditmanagestyles.inputGroup}>
            <Text style={creditmanagestyles.inputLabel}>Package Name</Text>
            <TextInput
              style={creditmanagestyles.textInput}
              value={packageName}
              onChangeText={setPackageName}
              placeholder="e.g. Basic Package"
            />
          </View>

          <View style={creditmanagestyles.rowInputs}>
            <View style={[creditmanagestyles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={creditmanagestyles.inputLabel}>Credits</Text>
              <TextInput
                style={creditmanagestyles.textInput}
                value={packageCredits}
                onChangeText={setPackageCredits}
                placeholder="100"
                keyboardType="number-pad"
              />
            </View>

            <View style={[creditmanagestyles.inputGroup, { flex: 1 }]}>
              <Text style={creditmanagestyles.inputLabel}>Price ($)</Text>
              <TextInput
                style={creditmanagestyles.textInput}
                value={packagePrice}
                onChangeText={setPackagePrice}
                placeholder="9.99"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={creditmanagestyles.inputGroup}>
            <Text style={creditmanagestyles.inputLabel}>Duration (days)</Text>
            <TextInput
              style={creditmanagestyles.textInput}
              value={packageDuration}
              onChangeText={setPackageDuration}
              placeholder="30"
              keyboardType="number-pad"
            />
          </View>

          <View style={creditmanagestyles.inputGroup}>
            <Text style={creditmanagestyles.inputLabel}>Description</Text>
            <TextInput
              style={[creditmanagestyles.textInput, creditmanagestyles.textAreaInput]}
              value={packageDescription}
              onChangeText={setPackageDescription}
              placeholder="Describe the package benefits..."
              multiline={true}
              numberOfLines={3}
            />
          </View>

          <View style={creditmanagestyles.switchRow}>
            <View style={creditmanagestyles.switchGroup}>
              <Text style={creditmanagestyles.switchLabel}>Mark as Popular</Text>
              <Switch
                trackColor={{ false: "#ddd", true: "#ffecb3" }}
                thumbColor={packageIsPopular ? "#ffc107" : "#f4f3f4"}
                ios_backgroundColor="#ddd"
                onValueChange={() => setPackageIsPopular(!packageIsPopular)}
                value={packageIsPopular}
              />
            </View>

            <View style={creditmanagestyles.switchGroup}>
              <Text style={creditmanagestyles.switchLabel}>Active</Text>
              <Switch
                trackColor={{ false: "#ddd", true: "#bfe8d4" }}
                thumbColor={packageIsActive ? "#00cc66" : "#ff3333"}
                ios_backgroundColor="#ddd"
                onValueChange={() => setPackageIsActive(!packageIsActive)}
                value={packageIsActive}
              />
            </View>
          </View>

          <View style={creditmanagestyles.modalButtons}>
            <TouchableOpacity style={[creditmanagestyles.modalButton, creditmanagestyles.cancelButton]} onPress={onClose}>
              <Text style={creditmanagestyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[creditmanagestyles.modalButton, creditmanagestyles.saveButton]} onPress={onSave}>
              <Text style={creditmanagestyles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PackageFormModal;
