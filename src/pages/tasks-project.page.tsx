import { Filter, Task } from "@/interfaces/task.interface";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateFinishedTasksTime, calculateOpenedTasksTime, calculatePauseTime } from "@/utils/task.utils";
import { useEffect, useState } from "react";

import { Container } from "@/components/common/container.component";
import { CreateOrUpdateTask } from "@/components/tasks/createOrUpdateTask.component";
import { FilterTaskProject } from "@/components/tasks/filter-task-project.component";
import { Header } from "@/components/common/header.component";
import { Main } from "@/components/common/main.component";
import { TaskApi } from "@/application/tasks/task.api";
import { TaskDescription } from "@/components/tasks/task-description.component";
import { TaskMenu } from "@/components/tasks/task-menu.component";
import { formatDate } from "@/utils/date-converter.utils";
import { useLocation } from "react-router-dom";

export function TasksProjectPage() {
  const taskApi = new TaskApi()
  const { state: { project } } = useLocation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [task, setTask] = useState<Task | undefined>(undefined);

  useEffect(() => { loadTasks() }, []);

  const loadTasks = async (filter?: Filter): Promise<void> => {
    let final: Filter = {
      projectIds: [project._id],
      start: new Date(),
      finish: new Date(),
    }

    if (filter) {
      final = { ...final, ...filter }
    }

    const { items } = await taskApi.findAll(final)

    setTasks(sortTasks(items))
  }

  const selectTask = (task: Task): void => {
    setTask(task);
  }

  const sortTasks = (tasks: Task[]): Task[] => {
    const finished = tasks.filter(task => task.finished).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const unfinished = tasks.filter(task => !task.finished).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return [...unfinished, ...finished];
  }

  const columns: string[] = ['Name', 'Description', 'Date', '']

  return (
    <div className="flex flex-row h-full gap-10">
      <div className={task ? 'w-3/4' : 'w-full  '}>
        <Container>
          <Header title={project.name} pathNavigation="/tasks">
            <div className="flex flex-row gap-2">
              <span className="flex items-center">Opened: {calculateOpenedTasksTime(tasks)}</span>
              <span className="flex items-center">Worked: {calculateFinishedTasksTime(tasks)}</span>
              <span className="flex items-center">Paused: {calculatePauseTime(tasks)}</span>
              <CreateOrUpdateTask project={project} whenCreated={loadTasks} />
              <FilterTaskProject filter={({ from, to }) => loadTasks({ start: from, finish: to })} />
            </div>
          </Header>
          <Main>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead key={index}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks && tasks.map(task => (
                  <TableRow key={task._id}>
                    <TableCell
                      className={`cursor-pointer ${task.finished ? "line-through" : ''}`}
                      onClick={() => { selectTask(task) }}
                    >{task.name}
                    </TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{formatDate(task.start)} - {task?.finished && formatDate(task.finish)}</TableCell>
                    <TableCell>
                      <TaskMenu task={task} refreshParent={loadTasks} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Main>
        </Container>
      </div>
      {task &&
        <div className="w-2/5">
          {task && <TaskDescription task={task} hidden={() => setTask(undefined)} />}
        </div>
      }
    </div>
  )
}