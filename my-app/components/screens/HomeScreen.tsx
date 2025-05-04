import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  FlatList,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
// Platform check for layout animation
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
// Import the todo service
import { fetchTodos, addTodo, updateTodo, deleteTodo } from '../../services/todoService';
// Update the Todo interface
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
export default function HomeScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList>(null);
  
  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  // Set up keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Scroll to edited item when keyboard appears
  useEffect(() => {
    if (editId !== null && keyboardVisible && flatListRef.current) {
      // Find the index of the item being edited
      const index = todos.findIndex(t => t.id === editId);
      if (index !== -1) {
        // Small delay to ensure the keyboard is fully shown
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5, // Center it in the visible area
          });
        }, 100);
      }
    }
  }, [editId, keyboardVisible, todos]);
  
  // Animation effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const loadTodos = async () => {
    try {
      setLoading(true);
      const apiTodos = await fetchTodos();
      const formattedTodos = apiTodos.map(todo => ({
        id: todo.id,
        text: todo.todo,
        completed: todo.completed
      }));
      setTodos(formattedTodos);
    } catch (error) {
      Alert.alert('Error', 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTodo = async () => {
    if (todoText.trim()) {
      try {
        setLoading(true);
        const newTodo = await addTodo(todoText);
        setTodos(prev => [...prev, {
          id: newTodo.id,
          text: newTodo.todo,
          completed: newTodo.completed,
        }]);
        setTodoText('');
        setIsModalVisible(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to add todo');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleDeleteTodo = async (id: number) => {
    try {
      setLoading(true);
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete todo');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompleteTodo = async (id: number) => {
    try {
      setLoading(true);
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      const updatedTodo = await updateTodo(id, { completed: !todo.completed });
      
      // Apply layout animation for smoother transitions
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      setTodos(prev =>
        prev.map(t => t.id === id ? {
          ...t,
          completed: updatedTodo.completed,
        } : t)
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update todo');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartEdit = (id: number, currentText: string) => {
    setEditId(id);
    setEditText(currentText);
  };
  
  const handleSaveEdit = async () => {
    if (editId !== null && editText.trim()) {
      try {
        setLoading(true);
        const updatedTodo = await updateTodo(editId, { todo: editText });
        setTodos(prev =>
          prev.map(t => t.id === editId ? {
            ...t,
            text: updatedTodo.todo,
          } : t)
        );
        setEditId(null);
        setEditText('');
        Keyboard.dismiss();
      } catch (error) {
        Alert.alert('Error', 'Failed to update todo');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
    Keyboard.dismiss();
  };
  
  const clearCompleted = () => {
    Alert.alert('Clear completed tasks?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            const completedTodos = todos.filter(todo => todo.completed);
            await Promise.all(completedTodos.map(todo => deleteTodo(todo.id)));
            
            // Apply layout animation for smoother transitions
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            
            setTodos(prev => prev.filter(todo => !todo.completed));
          } catch (error) {
            Alert.alert('Error', 'Failed to clear completed todos');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };
  
  const toggleCompletedVisibility = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCompleted(!showCompleted);
  };
  
  const renderTodoItem = ({ item, index }: { item: Todo, index: number }) => {
    const isEditing = editId === item.id;
    return (
      <View style={styles.todoItem}>
        <TouchableOpacity
          onPress={() => handleCompleteTodo(item.id)}
          style={[
            styles.completeButton,
            { backgroundColor: item.completed ? '#22c55e' : '#334155' },
          ]}
        >
          {item.completed && <Ionicons name="checkmark" size={18} color="#fff" />}
        </TouchableOpacity>
        {isEditing ? (
          <View style={styles.editInputContainer}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              autoFocus
              onSubmitEditing={handleSaveEdit}
              blurOnSubmit={false}
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={cancelEdit} style={styles.editActionButton}>
                <Ionicons name="close" size={22} color="#f87171" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveEdit} style={styles.editActionButton}>
                <Ionicons name="checkmark-done" size={22} color="#10b981" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.todoText,
                {
                  color: item.completed ? '#94a3b8' : '#f8fafc',
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                },
              ]}
            >
              {item.text}
            </Text>
            <TouchableOpacity
              onPress={() => handleStartEdit(item.id, item.text)}
              style={styles.iconButton}
            >
              <Ionicons name="create-outline" size={22} color="#60a5fa" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTodo(item.id)}>
              <Ionicons name="trash" size={22} color="#f87171" />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };
  
  // Filter todos for display
  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  const hasCompletedTodos = completedTodos.length > 0;
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradientBackground}
      >
        <Text style={styles.headerTitle}>My Todo List</Text>
        <Text style={styles.headerSubtitle}>Stay productive, stay organized</Text>
        
        <View style={styles.contentContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
          ) : (
            <ScrollView 
              contentContainerStyle={[
                styles.scrollContent,
                keyboardVisible && styles.scrollContentWithKeyboard
              ]}
            >
              {activeTodos.length === 0 && completedTodos.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="cloud-offline" size={96} color="#64748b" />
                  <Text style={styles.emptyText}>Nothing here yet...</Text>
                </View>
              ) : (
                <>
                  {/* Active Todos Section */}
                  {activeTodos.length > 0 && (
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Active Tasks</Text>
                      {activeTodos.map((todo) => renderTodoItem({ item: todo, index: 0 }))}
                    </View>
                  )}
                  
                  {/* Completed Todos Section */}
                  {hasCompletedTodos && (
                    <View style={styles.sectionContainer}>
                      <TouchableOpacity 
                        style={styles.sectionHeader}
                        onPress={toggleCompletedVisibility}
                        activeOpacity={0.7}
                      >
                        <View style={styles.sectionTitleContainer}>
                          <Text style={styles.sectionTitle}>Completed</Text>
                          <View style={styles.completedCountBadge}>
                            <Text style={styles.completedCountText}>{completedTodos.length}</Text>
                          </View>
                        </View>
                        <View style={styles.sectionHeaderRight}>
                          {showCompleted && (
                            <TouchableOpacity 
                              onPress={clearCompleted}
                              style={styles.clearTextButton}
                            >
                              <Text style={styles.clearText}>Clear All</Text>
                            </TouchableOpacity>
                          )}
                          <Ionicons 
                            name={showCompleted ? "chevron-up" : "chevron-down"} 
                            size={22} 
                            color="#94a3b8" 
                          />
                        </View>
                      </TouchableOpacity>
                      
                      {showCompleted && completedTodos.map((todo) => renderTodoItem({ item: todo, index: 0 }))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          )}
        </View>
        
        {!keyboardVisible && (
          <Animated.View
            style={[
              styles.fabContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              style={styles.fabButton}
            >
              <LinearGradient
                colors={['#0ea5e9', '#0284c7']}
                style={[StyleSheet.absoluteFill, { borderRadius: 30 }]}
              />
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <Modal
          visible={isModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setIsModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <LinearGradient
                  colors={['#0ea5e9', '#0284c7']}
                  style={styles.modalHeader}
                >
                  <Text style={styles.modalTitle}>Create New Task</Text>
                </LinearGradient>
                <View style={styles.modalContent}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="What do you need to do?"
                    value={todoText}
                    onChangeText={setTodoText}
                    autoFocus
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setIsModalVisible(false);
                        setTodoText('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
                      <Text style={styles.addButtonText}>Add Task</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a' 
  },
  gradientBackground: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 60 
  },
  headerTitle: { 
    fontSize: 34, 
    fontWeight: '700', 
    color: '#f8fafc' 
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: '#94a3b8', 
    marginBottom: 20 
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: { 
    paddingBottom: 100,
  },
  scrollContentWithKeyboard: {
    paddingBottom: 200, // Extra padding when keyboard is visible
  },
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 80, 
    opacity: 0.6 
  },
  emptyText: { 
    color: '#94a3b8', 
    fontSize: 18, 
    marginTop: 12 
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 6,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedCountBadge: {
    backgroundColor: '#475569',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  completedCountText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  clearTextButton: {
    marginRight: 10,
  },
  clearText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '500',
  },
  todoItem: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    marginVertical: 6,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  completeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  editInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#0f172a',
    marginRight: 8,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editActionButton: {
    padding: 6,
    marginHorizontal: 2,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    letterSpacing: 0.4,
  },
  iconButton: { 
    marginHorizontal: 8 
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    borderRadius: 30,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    color: '#f8fafc',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  modalInput: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#334155',
  },
  addButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});