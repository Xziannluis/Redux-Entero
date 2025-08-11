import { configureStore, createSlice, nanoid } from "@reduxjs/toolkit";
import { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, useWindowDimensions, View, } from "react-native";
import { Avatar, Banner, Button, Card, Divider, TextInput, } from "react-native-paper";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";

const todosSlice = createSlice({
  name: "todos",
  initialState: { items: [] },
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
  prepare: (title) => ({
        payload: {
          id: nanoid(),
          title,
          done: false,
          createdAt: Date.now(),
        },
        meta: undefined,
        error: undefined,
      }),
    },
    toggleTodo(state, action) {
      const t = state.items.find((x) => x.id === action.payload);
      if (t) t.done = !t.done;
    },
    removeTodo(state, action) {
      state.items = state.items.filter((x) => x.id !== action.payload);
    },
    clearTodos(state) {
      state.items = [];
    },
  },
});

const { addTodo, toggleTodo, removeTodo, clearTodos } = todosSlice.actions;

const store = configureStore({
  reducer: {
    todos: todosSlice.reducer,
  },
});

export default function App() {
  return (
    <ReduxProvider store={store}>
      <SafeAreaView style={{ flex: 1 }}>
        <TodosCard />
      </SafeAreaView>
    </ReduxProvider>
  );
}

export function TodosCard() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.todos.items);
  const [title, setTitle] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const { width } = useWindowDimensions();
  const numColumns = width >= 900 ? 2 : 1;

  const handleAdd = () => {
    if (!title.trim()) return;
    dispatch(addTodo(title.trim()));
    setTitle("");
    setShowBanner(true);
  };

  const activeTodos = items.filter((item) => !item.done);
  const doneTodos = items.filter((item) => item.done);

  return (
    <View>
      <Card style={styles.card}>
        <Card.Title
          title="Active Todos"
          subtitle="Add and manage your tasks"
          left={(props) => <Avatar.Icon {...props} icon="check" />}
        />
        <Card.Content>
          {showBanner && (
            <Banner
              visible={showBanner}
              actions={[{ label: "Dismiss", onPress: () => setShowBanner(false) }]}
              icon="information"
              style={{ marginBottom: 8 }}
            >
              A new task has been added to the list
            </Banner>
          )}
          <View style={styles.row}> 
            <TextInput
              style={{ flex: 1 }}
              label="What needs doing?"
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={handleAdd}
            />
            <Button mode="contained" onPress={handleAdd}>
              Add
            </Button>
          </View>
          <Divider style={{ marginVertical: 12 }} />
          <FlatList
            data={activeTodos}
            key={numColumns}
            numColumns={numColumns}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <View
                style={{
                  flex: 1,
                  marginRight: numColumns > 1 ? 8 : 0,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: 8,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
                <Text style={{ color: "#888", fontSize: 12 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
                <View style={styles.row}>
                  <Button onPress={() => dispatch(toggleTodo(item.id))}>
                    Done
                  </Button>
                  <Button onPress={() => dispatch(removeTodo(item.id))} textColor="#d11">
                    Remove
                  </Button>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ marginTop: 8 }}>No active todos. Add one above.</Text>
            }
          />
          {activeTodos.length > 0 && (
            <Button style={{ marginTop: 8 }} onPress={() => activeTodos.forEach(todo => dispatch(removeTodo(todo.id)))}>
              Clear All
            </Button>
          )}
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title
          title="Completed Todos"
          subtitle="Undo to move back to active"
          left={(props) => <Avatar.Icon {...props} icon="check-circle" />}
        />
        <Card.Content>
          <FlatList
            data={doneTodos}
            key={numColumns + 1}
            numColumns={numColumns}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <View
                style={{
                  flex: 1,
                  marginRight: numColumns > 1 ? 8 : 0,
                  backgroundColor: "#e6ffe6",
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: 8,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
                <Text style={{ color: "#888", fontSize: 12 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
                <View style={styles.row}>
                  <Button onPress={() => dispatch(toggleTodo(item.id))}>
                    Undo
                  </Button>
                  <Button onPress={() => dispatch(removeTodo(item.id))} textColor="rgba(250, 250, 250, 1)">
                    Remove
                  </Button>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ marginTop: 8 }}>No completed todos.</Text>
            }
          />
          {doneTodos.length > 0 && (
            <Button style={{ marginTop: 8 }} onPress={() => doneTodos.forEach(todo => dispatch(removeTodo(todo.id)))}>
              Clear All
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});



