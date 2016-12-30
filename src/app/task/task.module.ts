import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }   from '@angular/forms';

import { TasksComponent }  from './tasks.component';
import { taskRouting } from './task.routing';
import { TaskService } from "./task.service"
import { HttpModule } from '@angular/http';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        taskRouting
    ],
    declarations: [
        TasksComponent
    ],
    providers: [
        TaskService
    ]
})
export class TaskModule {
}
