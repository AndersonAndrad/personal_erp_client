import { Filter, Pause, RegisterTask, Task, TaskNotation } from '@/interfaces/task.interface';
import { createTasksValidate, updateTasksValidate } from './task.validators';

import { PaginatedResponse } from '@/interfaces/paginate.interface';
import { buildParamsFromObject } from '@/utils/http.utils';
import { convertCentsToMoney } from '@/utils/currency.utils';
import { removeUnecessaryWhiteSpace } from '@/utils/string.utils';
import serverApi from '../../infra/api/server.api';
import { toast } from 'sonner';

export class TaskApi {
  private TASK_URL: string = 'tasks';

  findAll(filter?: Filter): Promise<PaginatedResponse<Task>> {
    return new Promise((resolve, reject) => {
      serverApi
        .get(`${this.TASK_URL}${buildParamsFromObject(filter)}`)
        .then(({ data }) => {
          let { items, meta } = data as PaginatedResponse<Task>;
          items = items.map((item) => {
            item.project.hoursPrice = convertCentsToMoney(item.project.hoursPrice);

            return item;
          });

          const paginatedResponse: PaginatedResponse<Task> = {
            items,
            meta,
          };

          resolve(paginatedResponse);
        })
        .catch((error) => {
          toast('Error to load tasks', { description: error.message });
          reject(error);
        });
    });
  }

  create(createTaskDto: RegisterTask) {
    createTaskDto.name = removeUnecessaryWhiteSpace(createTaskDto.name);
    createTaskDto.description = removeUnecessaryWhiteSpace(createTaskDto.description);

    if (createTaskDto.scheduled) {
      delete createTaskDto.start;
      delete createTaskDto.finish;
    }

    try {
      createTasksValidate(createTaskDto);

      return new Promise((resolve, reject) => {
        serverApi
          .post(`${this.TASK_URL}`, createTaskDto)
          .then(() => {
            toast('Task created with success');
            resolve(null);
          })
          .catch((error) => {
            toast('Error to create task', { description: error.message });
            reject(error);
          });
      });
    } catch (error) {
      toast('Error to create task', { description: (error as any).message });
      throw new Error(error as any);
    }
  }

  delete(taskId: Task['_id']): Promise<void> {
    return new Promise((resolve, reject) => {
      serverApi
        .delete(`${this.TASK_URL}/${taskId}`)
        .then(() => {
          toast('Task deleted with success');
          resolve();
        })
        .catch((error) => {
          toast('Error to delete task', { description: error.message });
          reject(error);
        });
    });
  }

  update(taskId: Task['_id'], task: Partial<Omit<Task, 'start'>>): Promise<void> {
    updateTasksValidate(task);

    return new Promise((resolve, reject) => {
      serverApi
        .patch(`${this.TASK_URL}/${taskId}`, task)
        .then(() => {
          toast('Task updated with success');
          resolve();
        })
        .catch((error) => {
          toast('Error to update task', { description: error.message });
          reject(error);
        });
    });
  }

  addNotation(taskId: Task['_id'], notation: Pick<TaskNotation, 'notation'>): Promise<void> {
    return new Promise((resolve, reject) => {
      serverApi
        .post(`${this.TASK_URL}/${taskId}/add-notation`, notation)
        .then(() => {
          toast('Notation added to tasks with success');
          resolve();
        })
        .catch((error) => {
          toast('Error to add notation in task', {
            description: error.message,
          });
          reject(error);
        });
    });
  }

  /**
   * @param taskId
   */
  getNotationsByTask(taskId: Task['_id']): Promise<TaskNotation[]> {
    return new Promise((resolve, reject) => {
      serverApi
        .get(`${this.TASK_URL}/${taskId}/notations`)
        .then(({ data }) => {
          const notations = data as TaskNotation[];

          resolve(notations);
        })
        .catch((error) => {
          toast('Error to load notations', { description: error.message });
          reject(error);
        });
    });
  }

  deleteNotations(taskId: Task['_id'], notationsId: TaskNotation['_id']): Promise<void> {
    return new Promise((resolve, reject) => {
      serverApi
        .get(`${this.TASK_URL}/${taskId}/${notationsId}/delete-notation`)
        .then(() => resolve())
        .catch((error) => {
          toast('Error to try delete notation', { description: error.message });
          reject(error);
        });
    });
  }

  togglePauseStatus(taskId: Task['_id'], pauseTask?: Partial<Omit<Pause, '_id'>>): Promise<void> {
    return new Promise((resolve, reject) => {
      serverApi
        .patch(`${this.TASK_URL}/${taskId}/toggle-status`, pauseTask)
        .then(() => {
          toast('Status task changed with success');
          resolve();
        })
        .catch((error) => {
          toast('Error to change pause status notations', {
            description: error.message,
          });
          reject(error);
        });
    });
  }

  startTask(taskId: Task['_id']): Promise<void> {
    return new Promise((resolve, reject) => {
      serverApi
        .get(`${this.TASK_URL}/${taskId}/start-task`)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          toast('Error to start a task tasks', { description: error.message });
          reject(error);
        });
    });
  }
}
