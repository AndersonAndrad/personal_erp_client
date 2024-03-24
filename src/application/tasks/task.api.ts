import { Filter, Task } from "@/interfaces/task.interface";

import { PaginatedResponse } from "@/interfaces/paginate.interface";
import { buildParamsFromObject } from "@/utils/http.utils";
import { toast } from "sonner";
import serverApi from "../../infra/api/server.api";
import { createTasksValidate } from "./task.validators";

export class TaskApi {
  private TASK_URL: string = "tasks";

  findAll(filter?: Filter): Promise<PaginatedResponse<Task>> {
    return new Promise((resolve, reject) => {
      serverApi
        .get(`${this.TASK_URL}?${buildParamsFromObject(filter)}`)
        .then(({ data }) => {
          const { items, meta } = data as PaginatedResponse<Task>;
          const paginatedResponse: PaginatedResponse<Task> = {
            items,
            meta,
          };
          resolve(paginatedResponse);
        })
        .catch((error) => {
          toast("Error to load projects", { description: error.message });
          reject(error);
        });
    });
  }

  create(createTaskDto: Pick<Task, "name" | "description" | "project">) {
    createTasksValidate(createTaskDto);

    return new Promise((resolve, reject) => {
      serverApi
        .post(`${this.TASK_URL}`, createTaskDto)
        .then(() => {
          toast("Task created with success");
          resolve(null);
        })
        .catch((error) => {
          toast("Error to load projects", { description: error.message });
          reject(error);
        });
    });
  }
}
