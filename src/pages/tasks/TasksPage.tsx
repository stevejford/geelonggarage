import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, AlertCircle, MoreHorizontal, Clock, CheckCircle2, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import "./TasksPage.css";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  assigneeId: string;
  dueDate: string;
  description?: string;
  labels?: string[];
  attachments?: number;
  comments?: number;
  createdAt: string;
}

// Define column types
interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface KanbanData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
}

export default function TasksPage() {
  // State for adding a new column
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // State for adding a new task
  const [addingTaskInColumn, setAddingTaskInColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);

  // Initial Kanban data
  const [kanbanData, setKanbanData] = useState<KanbanData>({
    tasks: {
      'task-1': {
        id: 'task-1',
        title: 'Follow up with new lead',
        status: 'todo',
        priority: 'High',
        assignee: 'John Doe',
        assigneeId: 'john',
        dueDate: 'Today',
        labels: ['Lead', 'Sales'],
        comments: 2,
        createdAt: '2023-04-20'
      },
      'task-2': {
        id: 'task-2',
        title: 'Send quote to customer',
        status: 'inprogress',
        priority: 'Medium',
        assignee: 'Jane Smith',
        assigneeId: 'jane',
        dueDate: 'Tomorrow',
        description: 'Prepare and send quote for the new project',
        labels: ['Quote'],
        attachments: 1,
        createdAt: '2023-04-21'
      },
      'task-3': {
        id: 'task-3',
        title: 'Schedule technician visit',
        status: 'todo',
        priority: 'Low',
        assignee: 'John Doe',
        assigneeId: 'john',
        dueDate: 'Next week',
        createdAt: '2023-04-22'
      },
      'task-4': {
        id: 'task-4',
        title: 'Prepare monthly report',
        status: 'inprogress',
        priority: 'Medium',
        assignee: 'Jane Smith',
        assigneeId: 'jane',
        dueDate: 'Today',
        attachments: 3,
        comments: 5,
        createdAt: '2023-04-18'
      },
      'task-5': {
        id: 'task-5',
        title: 'Call back customer about invoice',
        status: 'todo',
        priority: 'High',
        assignee: 'John Doe',
        assigneeId: 'john',
        dueDate: 'Today',
        labels: ['Invoice', 'Urgent'],
        createdAt: '2023-04-22'
      },
      'task-6': {
        id: 'task-6',
        title: 'Order new parts for inventory',
        status: 'done',
        priority: 'Medium',
        assignee: 'Jane Smith',
        assigneeId: 'jane',
        dueDate: 'Yesterday',
        createdAt: '2023-04-15'
      },
      'task-7': {
        id: 'task-7',
        title: 'Review employee performance',
        status: 'done',
        priority: 'Low',
        assignee: 'John Doe',
        assigneeId: 'john',
        dueDate: 'Last week',
        createdAt: '2023-04-10'
      },
      'task-8': {
        id: 'task-8',
        title: 'Update website content',
        status: 'testing',
        priority: 'Medium',
        assignee: 'Jane Smith',
        assigneeId: 'jane',
        dueDate: 'Tomorrow',
        labels: ['Website', 'Content'],
        createdAt: '2023-04-21'
      },
      'task-9': {
        id: 'task-9',
        title: 'Follow up on customer complaint',
        status: 'testing',
        priority: 'High',
        assignee: 'John Doe',
        assigneeId: 'john',
        dueDate: 'Today',
        comments: 3,
        createdAt: '2023-04-22'
      },
    },
    columns: {
      'todo': {
        id: 'todo',
        title: 'To Do',
        taskIds: ['task-1', 'task-3', 'task-5'],
      },
      'inprogress': {
        id: 'inprogress',
        title: 'In Progress',
        taskIds: ['task-2', 'task-4'],
      },
      'testing': {
        id: 'testing',
        title: 'Testing',
        taskIds: ['task-8', 'task-9'],
      },
      'done': {
        id: 'done',
        title: 'Done',
        taskIds: ['task-6', 'task-7'],
      },
    },
    columnOrder: ['todo', 'inprogress', 'testing', 'done'],
  });

  // Handle drag end event
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or if the item was dropped back in its original position
    if (!destination ||
        (destination.droppableId === source.droppableId &&
         destination.index === source.index)) {
      return;
    }

    // Get the source and destination columns
    const sourceColumn = kanbanData.columns[source.droppableId];
    const destinationColumn = kanbanData.columns[destination.droppableId];

    // If moving within the same column
    if (sourceColumn.id === destinationColumn.id) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };

      const newState = {
        ...kanbanData,
        columns: {
          ...kanbanData.columns,
          [newColumn.id]: newColumn,
        },
      };

      setKanbanData(newState);
      return;
    }

    // Moving from one column to another
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    sourceTaskIds.splice(source.index, 1);
    const newSourceColumn = {
      ...sourceColumn,
      taskIds: sourceTaskIds,
    };

    const destinationTaskIds = Array.from(destinationColumn.taskIds);
    destinationTaskIds.splice(destination.index, 0, draggableId);
    const newDestinationColumn = {
      ...destinationColumn,
      taskIds: destinationTaskIds,
    };

    // Update the task's status
    const updatedTask = {
      ...kanbanData.tasks[draggableId],
      status: destination.droppableId
    };

    const newState = {
      ...kanbanData,
      tasks: {
        ...kanbanData.tasks,
        [draggableId]: updatedTask,
      },
      columns: {
        ...kanbanData.columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestinationColumn.id]: newDestinationColumn,
      },
    };

    setKanbanData(newState);

    // In a real application, you would update the task status in your database here
    console.log(`Task ${draggableId} moved from ${source.droppableId} to ${destination.droppableId}`);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get label color
  const getLabelColor = (label: string) => {
    const colors = {
      'Lead': 'bg-blue-100 text-blue-800',
      'Sales': 'bg-indigo-100 text-indigo-800',
      'Quote': 'bg-purple-100 text-purple-800',
      'Invoice': 'bg-orange-100 text-orange-800',
      'Urgent': 'bg-red-100 text-red-800',
      'Website': 'bg-teal-100 text-teal-800',
      'Content': 'bg-cyan-100 text-cyan-800',
    };
    return colors[label as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Get avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get avatar color
  const getAvatarColor = (id: string) => {
    const colors = {
      'john': 'bg-blue-500',
      'jane': 'bg-purple-500',
    };
    return colors[id as keyof typeof colors] || 'bg-gray-500';
  };

  // Handle adding a new column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;

    // Generate a unique ID for the new column
    const columnId = `column-${Date.now()}`;

    // Create the new column
    const newColumn: Column = {
      id: columnId,
      title: newColumnTitle.trim(),
      taskIds: [],
    };

    // Update the kanban data
    const newState = {
      ...kanbanData,
      columns: {
        ...kanbanData.columns,
        [columnId]: newColumn,
      },
      columnOrder: [...kanbanData.columnOrder, columnId],
    };

    // Update state
    setKanbanData(newState);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  // Handle adding a new task
  const handleAddTask = (columnId: string) => {
    console.log("handleAddTask called with columnId:", columnId);
    console.log("newTaskTitle:", newTaskTitle);

    if (!newTaskTitle.trim() || !columnId) {
      console.log("Task title is empty or columnId is invalid");
      return;
    }

    // Generate a unique ID for the new task
    const taskId = `task-${Date.now()}`;
    console.log("Generated taskId:", taskId);

    // Create the new task
    const newTask: Task = {
      id: taskId,
      title: newTaskTitle.trim(),
      status: columnId,
      priority: newTaskPriority,
      assignee: "Unassigned",
      assigneeId: "unassigned",
      dueDate: newTaskDueDate ? format(newTaskDueDate, "MMM d") : "Not set",
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Get the current column
    const column = kanbanData.columns[columnId];
    console.log("Current column:", column);

    // Update the kanban data
    const newState = {
      ...kanbanData,
      tasks: {
        ...kanbanData.tasks,
        [taskId]: newTask,
      },
      columns: {
        ...kanbanData.columns,
        [columnId]: {
          ...column,
          taskIds: [...column.taskIds, taskId],
        },
      },
    };

    console.log("New state:", newState);

    // Update state
    setKanbanData(newState);
    setNewTaskTitle("");
    setNewTaskPriority("Medium");
    setNewTaskDueDate(undefined);
    setAddingTaskInColumn(null);

    console.log("Task added successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage and organize your tasks</p>
        </div>
      </div>

      <div className="kanban-board-container overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4" style={{ minHeight: '70vh' }}>
            {kanbanData.columnOrder.map(columnId => {
              const column = kanbanData.columns[columnId];
              const tasks = column.taskIds.map(taskId => kanbanData.tasks[taskId]);

              return (
                <div key={column.id} className="kanban-column w-80 flex-shrink-0">
                  <div className="bg-gray-100 rounded-t-lg p-3 font-medium flex items-center justify-between">
                    <div className="flex items-center">
                      <span>{column.title}</span>
                      <span className="ml-2 bg-white text-gray-600 text-xs rounded-full px-2 py-1">
                        {column.taskIds.length}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`kanban-tasks p-2 rounded-b-lg min-h-[500px] ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'}`}
                      >
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`task-card bg-white rounded-lg shadow-sm p-3 mb-2 ${snapshot.isDragging ? 'shadow-md' : ''}`}
                                style={{
                                  ...provided.draggableProps.style,
                                }}
                              >
                                {/* Task labels */}
                                {task.labels && task.labels.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {task.labels.map((label, i) => (
                                      <span
                                        key={i}
                                        className={`text-xs px-2 py-0.5 rounded-full ${getLabelColor(label)}`}
                                      >
                                        {label}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Task title */}
                                <h3 className="font-medium text-gray-800 mb-2">{task.title}</h3>

                                {/* Task metadata */}
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                                  <div className="flex items-center gap-2">
                                    {/* Due date */}
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {task.dueDate}
                                    </div>

                                    {/* Priority */}
                                    <span className={`px-1.5 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </div>

                                  {/* Task actions */}
                                  <div className="flex items-center gap-2">
                                    {task.comments && (
                                      <span className="flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {task.comments}
                                      </span>
                                    )}
                                    {task.attachments && (
                                      <span className="flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {task.attachments}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Assignee */}
                                <div className="flex justify-end mt-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className={getAvatarColor(task.assigneeId)}>
                                      {getInitials(task.assignee)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Add task form or button */}
                        {addingTaskInColumn === column.id ? (
                          <div className="bg-white p-2 rounded-lg shadow-sm mt-2 add-task-form">
                            <textarea
                              value={newTaskTitle}
                              onChange={(e) => {
                                console.log("Textarea value changed:", e.target.value);
                                setNewTaskTitle(e.target.value);
                              }}
                              placeholder="Enter a title for this card..."
                              className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                console.log("Key pressed:", e.key);
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddTask(column.id);
                                }
                                if (e.key === 'Escape') {
                                  setAddingTaskInColumn(null);
                                  setNewTaskTitle('');
                                }
                              }}
                            />
                            <div className="grid grid-cols-1 gap-2 mb-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                                <Select
                                  value={newTaskPriority}
                                  onValueChange={setNewTaskPriority}
                                >
                                  <SelectTrigger className="w-full h-8 text-sm">
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="High">
                                      <span className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                                        High
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="Medium">
                                      <span className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                                        Medium
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="Low">
                                      <span className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                        Low
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                                <DatePicker
                                  date={newTaskDueDate}
                                  setDate={setNewTaskDueDate}
                                  placeholder="Set due date"
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <Button
                                size="sm"
                                onClick={() => handleAddTask(column.id)}
                                disabled={!newTaskTitle.trim()}
                              >
                                Add Card
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setAddingTaskInColumn(null);
                                  setNewTaskTitle('');
                                  setNewTaskPriority('Medium');
                                  setNewTaskDueDate(undefined);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 justify-start mt-2"
                            onClick={() => setAddingTaskInColumn(column.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add a card
                          </Button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}

            {/* Add new column button/form */}
            <div className="w-80 flex-shrink-0">
              {isAddingColumn ? (
                <div className="bg-white p-2 rounded-lg shadow-sm add-column-form">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Enter column title..."
                    className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddColumn();
                      if (e.key === 'Escape') {
                        setIsAddingColumn(false);
                        setNewColumnTitle('');
                      }
                    }}
                  />
                  <div className="flex justify-between">
                    <Button
                      onClick={handleAddColumn}
                      disabled={!newColumnTitle.trim()}
                    >
                      Add List
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnTitle('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-10 text-gray-500 hover:text-gray-700 border-dashed border-2"
                  onClick={() => setIsAddingColumn(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add another list
                </Button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
