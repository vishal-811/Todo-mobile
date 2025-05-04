const BASE_URL = 'https://dummyjson.com';

export interface ApiTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export const fetchTodos = async (): Promise<ApiTodo[]> => {
  try {
    const response = await fetch(`${BASE_URL}/todos`);
    const data = await response.json();
    return data.todos;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

export const addTodo = async (todo: string): Promise<ApiTodo> => {
  try {
    const response = await fetch(`${BASE_URL}/todos/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todo,
        completed: false,
        userId: 1, // Using default user ID
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

export const updateTodo = async (id: number, updates: Partial<ApiTodo>): Promise<ApiTodo> => {
  try {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodo = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data.isDeleted;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};