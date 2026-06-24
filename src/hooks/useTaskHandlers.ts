import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestoreDb, handleFirestoreError, OperationType } from '../firebase';
import { Task, TaskStatus, Comment, UserProfile } from '../types';

interface UseTaskHandlersParams {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  currentUser: UserProfile;
  displayCurrentUser: UserProfile;
  hasPermission: (permissionKey: any, task?: Task) => boolean;
  toast: {
    success: (title: string, desc: string) => void;
    error: (title: string, desc: string) => void;
    info: (title: string, desc: string) => void;
  };
  setSelectedTaskForDetail: (task: Task | null) => void;
  selectedTaskForDetail: Task | null;
  setIsCreateModalOpen: (open: boolean) => void;
  writeLocalJson: (key: string, data: any) => void;
  LOCAL_TASKS_KEY: string;
  getStatusLabel: (status: TaskStatus) => string;
}

export function useTaskHandlers({
  tasks,
  setTasks,
  currentUser,
  displayCurrentUser,
  hasPermission,
  toast,
  setSelectedTaskForDetail,
  selectedTaskForDetail,
  setIsCreateModalOpen,
  writeLocalJson,
  LOCAL_TASKS_KEY,
  getStatusLabel,
}: UseTaskHandlersParams) {
  
  const getCurrentTimeFormatted = () => {
    const now = new Date();
    const minStr = String(now.getMinutes()).padStart(2, '0');
    const hrStr = String(now.getHours()).padStart(2, '0');
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${hrStr}:${minStr}`;
  };

  const persistTasksLocally = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    writeLocalJson(LOCAL_TASKS_KEY, updatedTasks);
  };

  const persistTaskLocally = (updatedTask: Task) => {
    const updatedTasks = tasks.some(t => t.id === updatedTask.id)
      ? tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
      : [updatedTask, ...tasks];
    persistTasksLocally(updatedTasks);
  };

  const removeTaskLocally = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    persistTasksLocally(updatedTasks);
  };

  // CREATE TASK
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'comments' | 'history'>) => {
    if (!hasPermission('createTask')) {
      toast.error('Không có quyền truy cập', 'Tài khoản của bạn không được cấp quyền khởi tạo chỉ đạo / nhiệm vụ mới.');
      return;
    }
    const newTaskId = `task_${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: newTaskId,
      comments: [],
      history: [
        {
          id: `h_${Date.now()}`,
          userName: displayCurrentUser.name,
          userTitle: displayCurrentUser.title,
          action: `Đã khởi tạo và giao công việc`,
          createdAt: getCurrentTimeFormatted()
        }
      ]
    };

    persistTaskLocally(newTask);
    try {
      await setDoc(doc(firestoreDb, 'tasks', newTaskId), newTask);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `tasks/${newTaskId}`);
    }
    setIsCreateModalOpen(false);
  };

  // UPDATE STATUS
  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus, evidence?: string) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    if (evidence) {
      if (!hasPermission('submitReport', t)) {
        toast.error('Không có quyền truy cập', 'Tài khoản của bạn không có quyền gửi báo cáo & minh chứng thực hiện.');
        return;
      }
    } else if (newStatus === 'HOAN_THANH') {
      if (!hasPermission('approveReport', t)) {
        toast.error('Không có quyền truy cập', 'Tài khoản của bạn không có quyền nghiệm thu hoặc duyệt báo cáo hoàn thành.');
        return;
      }
    } else {
      if (!hasPermission('changeStatus', t)) {
        toast.error('Không có quyền truy cập', 'Tài khoản của bạn không được cấp quyền thay đổi tiến độ công việc.');
        return;
      }
    }

    const historyAction = evidence 
      ? `Đã gửi báo cáo minh chứng: "${evidence.substring(0, 50)}..."`
      : `Đã chuyển đổi trạng thái công việc thành "${getStatusLabel(newStatus)}"`;

    const updatedHistory = [
      ...t.history,
      {
        id: `h_${Date.now()}`,
        userName: displayCurrentUser.name,
        userTitle: displayCurrentUser.title,
        action: historyAction,
        createdAt: getCurrentTimeFormatted()
      }
    ];

    const updatedTask = {
      ...t,
      status: newStatus,
      history: updatedHistory,
      rejectionReason: newStatus === 'HOAN_THANH' ? '' : (t.rejectionReason || ''),
      reportEvidence: evidence !== undefined ? evidence : (t.reportEvidence || '')
    };

    persistTaskLocally(updatedTask);
    try {
      await setDoc(doc(firestoreDb, 'tasks', taskId), updatedTask);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  // REJECT TASK
  const handleRejectTask = async (taskId: string, reason: string) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    if (!hasPermission('rejectReport', t)) {
      toast.error('Không có quyền truy cập', 'Tài khoản của bạn không được cấp quyền yêu cầu điều chỉnh báo cáo.');
      return;
    }

    const updatedHistory = [
      ...t.history,
      {
        id: `h_${Date.now()}`,
        userName: displayCurrentUser.name,
        userTitle: displayCurrentUser.title,
        action: `Yêu cầu chỉnh sửa lại: "${reason}"`,
        createdAt: getCurrentTimeFormatted()
      }
    ];

    const updatedTask = {
      ...t,
      status: 'DANG_TIEN_HANH' as TaskStatus,
      rejectionReason: reason,
      history: updatedHistory
    };

    persistTaskLocally(updatedTask);
    try {
      await setDoc(doc(firestoreDb, 'tasks', taskId), updatedTask);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  // DELETE TASK
  const handleDeleteTask = async (taskId: string) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    if (!hasPermission('deleteTask', t)) {
      toast.error('Không có quyền truy cập', 'Tài khoản của bạn không được cấp quyền xóa chỉ đạo.');
      return;
    }
    removeTaskLocally(taskId);
    try {
      await deleteDoc(doc(firestoreDb, 'tasks', taskId));
      if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
        setSelectedTaskForDetail(null);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  // UPDATE TASK
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    const isOnlyChecklistUpdate = Object.keys(updates).length === 1 && updates.checklist !== undefined;
    const canEditTask = hasPermission('editTask', t);
    const isAssignee = t.assignedId === currentUser.id;

    if (!canEditTask && !(isOnlyChecklistUpdate && isAssignee)) {
      toast.error('Không có quyền truy cập', 'Tài khoản của bạn không được cấp quyền chỉnh sửa nhiệm vụ.');
      return;
    }

    const updatedHistory = [...t.history];
    const changes: string[] = [];
    if (updates.title && updates.title !== t.title) changes.push('tiêu đề');
    if (updates.description && updates.description !== t.description) changes.push('mô tả');
    if (updates.deadline && updates.deadline !== t.deadline) changes.push('hạn chót');
    if (updates.assignedId && updates.assignedId !== t.assignedId) {
      changes.push(`người thực hiện (${updates.assignedName})`);
    }

    if (changes.length > 0) {
      updatedHistory.push({
        id: `h_${Date.now()}`,
        userName: displayCurrentUser.name,
        userTitle: displayCurrentUser.title,
        action: `Đã chỉnh sửa ${changes.join(', ')} của công việc`,
        createdAt: getCurrentTimeFormatted()
      });
    } else if (isOnlyChecklistUpdate) {
      const oldChecklist = t.checklist || [];
      const newChecklist = updates.checklist || [];
      if (newChecklist.length > oldChecklist.length) {
        updatedHistory.push({
          id: `h_${Date.now()}`,
          userName: displayCurrentUser.name,
          userTitle: displayCurrentUser.title,
          action: `Đã thêm mục checklist mới`,
          createdAt: getCurrentTimeFormatted()
        });
      } else if (newChecklist.length < oldChecklist.length) {
        updatedHistory.push({
          id: `h_${Date.now()}`,
          userName: displayCurrentUser.name,
          userTitle: displayCurrentUser.title,
          action: `Đã xóa mục checklist`,
          createdAt: getCurrentTimeFormatted()
        });
      } else {
        const changedItem = newChecklist.find((item, idx) => oldChecklist[idx] && item.done !== oldChecklist[idx].done);
        if (changedItem) {
          updatedHistory.push({
            id: `h_${Date.now()}`,
            userName: displayCurrentUser.name,
            userTitle: displayCurrentUser.title,
            action: `Đã đánh dấu ${changedItem.done ? 'hoàn thành' : 'chưa hoàn thành'} mục checklist "${changedItem.text}"`,
            createdAt: getCurrentTimeFormatted()
          });
        }
      }
    }

    const updatedTask = {
      ...t,
      ...updates,
      history: updatedHistory
    };

    persistTaskLocally(updatedTask);
    try {
      await setDoc(doc(firestoreDb, 'tasks', taskId), updatedTask);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  // ADD COMMENT
  const handleAddComment = async (taskId: string, commentContent: string) => {
    const t = tasks.find(item => item.id === taskId);
    if (!t) return;

    if (!hasPermission('addComment', t)) {
      toast.error('Không có quyền truy cập', 'Tài khoản của bạn không được cấp quyền thảo luận góp ý ý kiến.');
      return;
    }

    const newC: Comment = {
      id: `c_${Date.now()}`,
      userName: displayCurrentUser.name,
      userTitle: displayCurrentUser.title,
      content: commentContent,
      createdAt: getCurrentTimeFormatted().split(' ')[1] + ' ' + getCurrentTimeFormatted().split(' ')[0]
    };

    const updatedHistory = [
      ...t.history,
      {
        id: `h_${Date.now()}`,
        userName: displayCurrentUser.name,
        userTitle: displayCurrentUser.title,
        action: `Đã đóng góp thảo luận mới`,
        createdAt: getCurrentTimeFormatted()
      }
    ];

    const updatedTask = {
      ...t,
      comments: [...(t.comments || []), newC],
      history: updatedHistory
    };

    persistTaskLocally(updatedTask);
    try {
      await setDoc(doc(firestoreDb, 'tasks', taskId), updatedTask);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  return {
    handleCreateTask,
    handleUpdateStatus,
    handleRejectTask,
    handleDeleteTask,
    handleUpdateTask,
    handleAddComment,
    persistTaskLocally,
    removeTaskLocally,
    getCurrentTimeFormatted
  };
}
