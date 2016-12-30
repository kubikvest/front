import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TasksComponent }    from './tasks.component';

const taskRoutes:Routes = [
    {path: 'list/:token', component: TasksComponent}
];

export const taskRouting:ModuleWithProviders = RouterModule.forChild(taskRoutes);
