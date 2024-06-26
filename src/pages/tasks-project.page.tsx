import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Task } from "@/interfaces/task.interface";
import { allCalculators, calculateTotalMoneyEarned, finishedTaskTime } from "@/utils/task.utils";
import { BookmarkCheck, Clock5, Pause, } from "lucide-react";
import { useEffect, useState } from "react";

import { TaskApi } from "@/application/tasks/task.api";
import { Container } from "@/components/common/container.component";
import { Header } from "@/components/common/header.component";
import { Main } from "@/components/common/main.component";
import { CreateOrUpdateTask } from "@/components/tasks/create-task.component";
import { FilterTaskProject } from "@/components/tasks/filter-task-project.component";
import { SideNotation } from "@/components/tasks/side-notations.component";
import { TaskMenu } from "@/components/tasks/task-menu.component";
import { formatDate } from "@/utils/date-converter.utils";
import { objectIsNotEmpty } from "@/utils/object.utils";
import { firstLetterUppercase } from "@/utils/string.utils";
import { useLocation } from "react-router-dom";

export function TasksProjectPage() {
  const taskApi = new TaskApi()
  const { state: { project } } = useLocation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>({});
  const { finishedTask, moneyEarned, openedTask, pauseTask } = allCalculators(tasks)

  useEffect(() => { loadTasks() }, [project]);

  const loadTasks = async (filter?: Filter): Promise<void> => {
    let final: Filter = {}

    /**
     * @todo - when load tasks check if exists previous filter and apply last filter before search
     */
    if (filter && objectIsNotEmpty(filter)) {
      final = filter

      final['hashId'] = [project.hashId];

      if (filter?.scheduled) {
        final = {
          hashId: [project.hashId],
          scheduled: filter.scheduled
        }
      }
    } else {
      final = {
        hashId: [project.hashId],
        start: new Date(),
        finish: new Date(),
      }

      if (filter) final = { ...final, ...filter }

      if (filter?.scheduled) {
        final = {
          hashId: [project.hashId],
          scheduled: filter.scheduled
        }
      }
    }

    setFilter(final);

    const { items } = await taskApi.findAll(final)

    setTasks(sortTasks(items))
  }

  const sortTasks = (tasks: Task[]): Task[] => {
    const finished = tasks.filter(task => task.finished).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const unfinished = tasks.filter(task => !task.finished).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return [...unfinished, ...finished];
  }

  const taskStatus = (task: Task): JSX.Element => {
    if (task.finished) return <BookmarkCheck />

    if (task.paused) return <Pause />

    return <Clock5 />
  }

  const columns: string[] = ['Name', 'Description', 'Status', 'Earned', 'Time worked', 'Date', '']

  return (
    <Container>
      <Header title={project.name} pathNavigation="/tasks">
        <div className="flex flex-row gap-2">
          <span className="flex items-center">Gain: {moneyEarned}</span>
          <span className="flex items-center">Opened: {openedTask}</span>
          <span className="flex items-center">Worked: {finishedTask}</span>
          <span className="flex items-center">Paused: {pauseTask}</span>
          <CreateOrUpdateTask project={project} whenCreated={loadTasks} />
          <FilterTaskProject filter={(filter) => loadTasks(filter)} lastFilter={filter} />
        </div>
      </Header>
      <Main>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{firstLetterUppercase(column)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks && tasks.map(task => (
              <TableRow key={task._id}>
                <TableCell className="w-1/4">
                  <SideNotation key={task._id} task={task} />
                </TableCell>
                <TableCell className="w-1/4">{task.description}</TableCell>
                <TableCell className="items-center">{taskStatus(task)}</TableCell>
                <TableCell>{calculateTotalMoneyEarned([task])}</TableCell>
                <TableCell>{finishedTaskTime([task])}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{task?.start && formatDate(task.start)}</span>
                    <span>{task?.finished && formatDate(task.finish)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <TaskMenu task={task} refreshParent={loadTasks} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Main>
    </Container>
  )
}