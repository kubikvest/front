import { Component, OnInit } from '@angular/core';
import { TaskService } from "./task.service";
import {Task} from "./task.model";
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
    templateUrl: './list.html'
})

export class TasksComponent implements OnInit {
    token:string;
    tasks: Task[];
    constructor(private taskService:TaskService, private route:ActivatedRoute, private router: Router) {
    }
    
    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            this.token = params['token'];
            this.taskService.list(this.token).subscribe((data) => {
                this.tasks = data.tasks;
            });
        });
    }
}
