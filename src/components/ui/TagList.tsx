import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface TagListProps {
  label: string;
  items: string[];
  placeholder?: string;
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
}

export const TagList: React.FC<TagListProps> = ({
  label,
  items,
  placeholder = 'Add item',
  onAdd,
  onRemove,
}) => {
  const { theme } = useTheme();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme.colors.inputBorder,
              color: theme.colors.text,
            },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.cardBackground }]}
          onPress={handleAdd}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.accent }]}>Add</Text>
        </TouchableOpacity>
      </View>

      {items.map((item, index) => (
        <View
          key={index}
          style={[styles.tag, { backgroundColor: theme.colors.cardBackground }]}
        >
          <Text style={[styles.tagText, { color: theme.colors.text }]}>{item}</Text>
          <TouchableOpacity onPress={() => onRemove(index)}>
            <Text style={[styles.removeText, { color: theme.colors.error }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
  },
  addButtonText: {
    fontWeight: 'bold',
  },
  tag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagText: {
    flex: 1,
    fontSize: 14,
  },
  removeText: {
    fontWeight: 'bold',
  },
});
