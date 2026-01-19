import { useEffect } from "react";
import api from "../api/axios";

import { useState } from "react";
import "../theme/Boards.css";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/* ================= COLUMN ================= */
const BoardColumn = ({ 
  title, 
  color, 
  tasks, 
  onAddTask, 
  onDeleteTask,
  onArchiveDone, 
  onColumnSettings, 
  columnKey 
}) => {
  // 🔥 ADD THESE 2 NEW STATES (after existing useState lines)
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);  // 🔥 NEW
  const [taskToDelete, setTaskToDelete] = useState(null);        // 🔥 NEW

  const [form, setForm] = useState({
    title: "",
    desc: "",
    priority: "low",
    assignees: "",
    completedBy: "",
  });
  

 


  const handleSubmit = () => {
    if (!form.title.trim()) return;

    onAddTask({
      title: form.title,
      desc: form.desc,
      priority: form.priority,
      assignees: form.assignees
        ? form.assignees.split(",").map((i) => ({ initials: i.trim() }))
        : [],
      completedBy: form.completedBy || null,
    });

    setForm({
      title: "",
      desc: "",
      priority: "low",
      assignees: "",
      completedBy: "",
    });
    setAdding(false);
  };

  const handleArchiveDone = async () => {
  try {
    await api.delete("/tasks/archive/done");

    setColumns(prev => {
      const updated = {};
      for (const key in prev) {
        updated[key] = {
          ...prev[key],
          tasks: prev[key].tasks.filter(t => !t.completedBy),
        };
      }
      return updated;
    });
  } catch (err) {
    console.error("Archive failed", err.response?.data || err.message);
  }
};


  return (
    <div className="board-column">
      <div className="column-header">
        <div className="column-title">
          <span className="dot" style={{ background: color }} />
          <h4>{title}</h4>
          <span className="count">{tasks.length}</span>
        </div>

        <div className="column-actions">
          <button onClick={() => setShowMenu(!showMenu)}>⋯</button>
          {showMenu && (
            <div className="column-menu">
              <p onClick={() => { setAdding(true); setShowMenu(false); }}>
                ➕ Add task
              </p>
              <p onClick={() => { onColumnSettings(columnKey, title, color); setShowMenu(false); }}>⚙ Column settings</p>
              <p onClick={() => { navigate("/analytics"); setShowMenu(false); }}>📊 View analytics</p>
              <p 
                className="danger" 
                onClick={() => setShowConfirm(true)}
              >
                🗄 Archive all done ({tasks.filter(t => t.completedBy).length})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Archive Confirmation */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h4>Archive {tasks.filter(t => t.completedBy).length} done tasks?</h4>
            <p>This will remove ALL completed tasks from ALL columns.</p>
            <div className="confirm-actions">
              <button className="confirm-yes" onClick={handleArchiveDone}>
                Yes, archive
              </button>
              <button className="confirm-no" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 PREMIUM DELETE MODAL - NEW */}
      {showDeleteModal && taskToDelete && (
        <div className="delete-overlay">
          <div className="delete-modal">
            <div className="delete-header">
              <h3>🗑 Delete Task</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="delete-body">
              <p>Delete "<strong>{taskToDelete.title}</strong>"?</p>
              <p className="delete-subtext">This action cannot be undone.</p>
            </div>
            
            <div className="delete-actions">
              <button 
                className="delete-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm"
                onClick={() => {
                  onDeleteTask(columnKey, taskToDelete.id);
                  setShowDeleteModal(false);
                  setTaskToDelete(null);
                }}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 OPTIMIZED DROPPABLE TASK LIST */}
      <Droppable droppableId={columnKey}>
        {(provided, snapshot) => (
          <div 
            className={`task-list ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ minHeight: '420px' }}
          >
            {tasks.length === 0 && !adding && (
              <p className="empty-column">No tasks yet. Add one!</p>
            )}

            {/* 🔥 FIXED TASK RENDERING WITH DELETE */}
            {tasks.map((task, i) => (
              <Draggable key={task.id} draggableId={task.id} index={i}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                    style={provided.draggableProps.style}
                  >
                    {/* 🔥 CHANGED: Custom modal instead of window.confirm */}
                    <button 
                      className="task-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task);      // 🔥 NEW
                        setShowDeleteModal(true);   // 🔥 NEW
                      }}
                      title="Delete task"
                    >
                      ✕
                    </button>

                    <div className="task-top">
                      <span className={`priority ${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>

                    <h5>{task.title}</h5>
                    <p>{task.desc}</p>

                    <div className="task-footer">
                      <span className="date">📅 {task.date}</span>
                      <div className="avatars">
                        {task.assignees?.map((user, i) => (
                          <div className="avatar" key={i}>
                            {user.initials}
                          </div>
                        ))}
                      </div>
                    </div>

                    {task.completedBy && (
                      <div className="task-completed">
                        ✅ Done by: {task.completedBy}
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}

            {/* INLINE ADD TASK CARD */}
            {adding && (
              <div className="task-card add-card">
                <input
                  placeholder="Task title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />

                <textarea
                  placeholder="Description"
                  value={form.desc}
                  onChange={(e) =>
                    setForm({ ...form, desc: e.target.value })
                  }
                />

                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>

                <input
                  placeholder="Assignees initials (A,B,C)"
                  value={form.assignees}
                  onChange={(e) =>
                    setForm({ ...form, assignees: e.target.value })
                  }
                />

                <input
                  placeholder="Completed by (optional)"
                  value={form.completedBy}
                  onChange={(e) =>
                    setForm({ ...form, completedBy: e.target.value })
                  }
                />

                <div className="add-actions">
                  <button className="save" onClick={handleSubmit}>
                    Add
                  </button>
                  <button
                    className="cancel"
                    onClick={() => setAdding(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!adding && provided.placeholder}
            {!adding && (
              <button
                className="add-task-button"
                onClick={() => setAdding(true)}
              >
                + Add Task
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

/* ================= BOARDS PAGE ================= */
const Boards = () => {
  console.log("TOKEN IN BOARDS:", localStorage.getItem("token"));

  const [columns, setColumns] = useState({
    backlog: { 
      tasks: [], 
      title: "Backlog", 
      color: "#64748b" 
    },
    inProgress: { 
      tasks: [], 
      title: "In Progress", 
      color: "#2563eb" 
    },
    review: { 
      tasks: [], 
      title: "Review", 
      color: "#f59e0b" 
    },
    done: { 
      tasks: [], 
      title: "Done", 
      color: "#16a34a" 
    },
  });
    useEffect(() => {
  const loadTasks = async () => {
    try {
      const res = await api.get("/tasks/my");
      const tasks = res.data;

      const newColumns = {
        backlog: { ...columns.backlog, tasks: [] },
        inProgress: { ...columns.inProgress, tasks: [] },
        review: { ...columns.review, tasks: [] },
        done: { ...columns.done, tasks: [] },
      };

      tasks.forEach((task) => {
        const formatted = {
          id: task._id,
          title: task.title,
          desc: task.description || "",
          priority: "low",
          assignees: [],
          completedBy: task.status === "done" ? "You" : null,
          date: new Date(task.createdAt).toLocaleDateString(),
        };

        // Map tasks to the correct column based on their status
        if (task.status === "backlog") newColumns.backlog.tasks.push(formatted);
        else if (task.status === "inProgress") newColumns.inProgress.tasks.push(formatted);
        else if (task.status === "review") newColumns.review.tasks.push(formatted);
        else if (task.status === "done") newColumns.done.tasks.push(formatted);
        // Fallback for old status values (for backward compatibility)
        else if (task.status === "todo") newColumns.backlog.tasks.push(formatted);
        else if (task.status === "in-progress") newColumns.inProgress.tasks.push(formatted);
      });

      setColumns(newColumns);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  loadTasks();
}, []);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const navigate = useNavigate();

 const handleDeleteTask = async (columnKey, taskId) => {
  try {
    await api.delete(`/tasks/${taskId}`);

    setColumns((prev) => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        tasks: prev[columnKey].tasks.filter((t) => t.id !== taskId),
      },
    }));
  } catch (err) {
    console.error("Delete failed", err);
  }
};

 

  const handleAddTask = (columnKey) => async (task) => {
  try {
    const res = await api.post("/tasks", {
      title: task.title,
      description: task.desc,
      status: columnKey,  // Send the column key as status (backlog, inProgress, review, done)
    });

    const saved = res.data;

    const newTask = {
      id: saved._id,
      title: saved.title,
      desc: saved.description || "",
      priority: "low",
      assignees: [],
      completedBy: saved.status === "done" ? "You" : null,
      date: new Date(saved.createdAt).toLocaleDateString(),
    };

    setColumns((prev) => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        tasks: [...prev[columnKey].tasks, newTask],
      },
    }));
  } catch (err) {
    console.error("Add task failed", err);
  }
};


  const handleArchiveDone = (doneTasks) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      Object.keys(newColumns).forEach(key => {
        newColumns[key].tasks = newColumns[key].tasks.filter(task => !task.completedBy);
      });
      return newColumns;
    });
    console.log(`✅ Archived ${doneTasks.length} tasks!`);
  };

  const handleColumnSettings = (columnKey, currentTitle, currentColor) => {
    setEditingColumn({
      key: columnKey,
      title: currentTitle,
      color: currentColor
    });
    setShowSettingsModal(true);
  };

  const saveColumnSettings = () => {
    setColumns(prev => ({
      ...prev,
      [editingColumn.key]: {
        ...prev[editingColumn.key],
        title: editingColumn.title,
        color: editingColumn.color
      }
    }));
    setShowSettingsModal(false);
    setEditingColumn(null);
  };

 const onDragEnd = async (result) => {
  const { destination, source } = result;

  if (!destination) return;

  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return;
  }

  let sourceColumn = columns[source.droppableId];
  let destColumn = columns[destination.droppableId];

  const taskToMove = sourceColumn.tasks[source.index];

  const newSourceTasks = Array.from(sourceColumn.tasks);
  const newDestTasks = Array.from(destColumn.tasks);

  newSourceTasks.splice(source.index, 1);
  newDestTasks.splice(destination.index, 0, taskToMove);

  setColumns({
    ...columns,
    [source.droppableId]: {
      ...sourceColumn,
      tasks: newSourceTasks,
    },
    [destination.droppableId]: {
      ...destColumn,
      tasks: newDestTasks,
    },
  });

  console.log(
    `✅ Moved task "${taskToMove.title}" from ${source.droppableId} → ${destination.droppableId}`
  );

  // 🔥 BACKEND SAVE PART MUST BE INSIDE FUNCTION

  try {
    await api.put(`/tasks/${taskToMove.id}/status`, {
      status: destination.droppableId,  // Use the destination column key as status
    });
  } catch (err) {
    console.error("Status update failed", err);
  }
};


  const getPeopleSummary = () => {
    const summary = {};

    Object.values(columns).forEach((column) => {
      column.tasks.forEach((task) => {
        task.assignees?.forEach((user) => {
          if (!summary[user.initials]) {
            summary[user.initials] = { working: [], done: [] };
          }

          if (task.completedBy === user.initials) {
            summary[user.initials].done.push(task.title);
          } else {
            summary[user.initials].working.push(task.title);
          }
        });

        if (
          task.completedBy &&
          !task.assignees?.some(
            (a) => a.initials === task.completedBy
          )
        ) {
          if (!summary[task.completedBy]) {
            summary[task.completedBy] = { working: [], done: [] };
          }
          summary[task.completedBy].done.push(task.title);
        }
      });
    });

    return summary;
  };

  const peopleSummary = getPeopleSummary();

  return (
    <div className="boards-page">
      <div className="boards-header">
        <div>
          <h2>Kanban Board</h2>
          <p>Manage tasks with visual workflow ✨ Drag & Drop + Delete Enabled</p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-grid">
          <BoardColumn
            columnKey="backlog"
            title={columns.backlog.title}
            color={columns.backlog.color}
            tasks={columns.backlog.tasks}
            onAddTask={handleAddTask("backlog")}
            onDeleteTask={handleDeleteTask}
            onArchiveDone={handleArchiveDone}
            onColumnSettings={handleColumnSettings}
          />
          <BoardColumn
            columnKey="inProgress"
            title={columns.inProgress.title}
            color={columns.inProgress.color}
            tasks={columns.inProgress.tasks}
            onAddTask={handleAddTask("inProgress")}
            onDeleteTask={handleDeleteTask}
            onArchiveDone={handleArchiveDone}
            onColumnSettings={handleColumnSettings}
          />
          <BoardColumn
            columnKey="review"
            title={columns.review.title}
            color={columns.review.color}
            tasks={columns.review.tasks}
            onAddTask={handleAddTask("review")}
            onDeleteTask={handleDeleteTask}
            onArchiveDone={handleArchiveDone}
            onColumnSettings={handleColumnSettings}
          />
          <BoardColumn
            columnKey="done"
            title={columns.done.title}
            color={columns.done.color}
            tasks={columns.done.tasks}
            onAddTask={handleAddTask("done")}
            onDeleteTask={handleDeleteTask}
            onArchiveDone={handleArchiveDone}
            onColumnSettings={handleColumnSettings}
          />
        </div>
      </DragDropContext>

      {/* MODALS - UNCHANGED */}
      {showSettingsModal && editingColumn && (
        <div className="modal-overlay">
          <div className="settings-modal">
            <div className="modal-header">
              <h3>{editingColumn.title} Settings</h3>
              <button onClick={() => setShowSettingsModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <label>Column Name</label>
              <input 
                value={editingColumn.title} 
                onChange={(e) => setEditingColumn({
                  ...editingColumn, 
                  title: e.target.value
                })}
                placeholder="Enter column name"
              />
              
              <label>Column Color</label>
              <div className="color-picker">
                <button style={{background: '#64748b'}} 
                  className={editingColumn.color === '#64748b' ? 'active' : ''} 
                  onClick={() => setEditingColumn({
                    ...editingColumn, 
                    color: '#64748b'
                  })} 
                  title="Slate" />
                <button style={{background: '#2563eb'}} 
                  className={editingColumn.color === '#2563eb' ? 'active' : ''} 
                  onClick={() => setEditingColumn({
                    ...editingColumn, 
                    color: '#2563eb'
                  })} 
                  title="Blue" />
                <button style={{background: '#f59e0b'}} 
                  className={editingColumn.color === '#f59e0b' ? 'active' : ''} 
                  onClick={() => setEditingColumn({
                    ...editingColumn, 
                    color: '#f59e0b'
                  })} 
                  title="Amber" />
                <button style={{background: '#16a34a'}} 
                  className={editingColumn.color === '#16a34a' ? 'active' : ''} 
                  onClick={() => setEditingColumn({
                    ...editingColumn, 
                    color: '#16a34a'
                  })} 
                  title="Green" />
                <button style={{background: '#ef4444'}} 
                  className={editingColumn.color === '#ef4444' ? 'active' : ''} 
                  onClick={() => setEditingColumn({
                    ...editingColumn, 
                    color: '#ef4444'
                  })} 
                  title="Red" />
              </div>
              
              <label>Tasks</label>
              <span>{columns[editingColumn.key]?.tasks.length || 0} tasks in this column</span>
            </div>
            
            <div className="modal-actions">
              <button className="cancel" onClick={() => setShowSettingsModal(false)}>
                Cancel
              </button>
              <button className="save" onClick={saveColumnSettings}>
                ✅ Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="people-summary">
        <h3>People & Tasks</h3>
        {Object.keys(peopleSummary).length === 0 && (
          <p>No tasks assigned yet.</p>
        )}
        {Object.entries(peopleSummary).map(([user, tasks]) => (
          <div className="person" key={user}>
            <h4>{user}</h4>
            {tasks.working.length > 0 && (
              <p>🟡 Working on: {tasks.working.join(", ")}</p>
            )}
            {tasks.done.length > 0 && (
              <p>✅ Completed: {tasks.done.join(", ")}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Boards;