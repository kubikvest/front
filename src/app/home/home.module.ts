import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }   from '@angular/forms';

import { HomeComponent }  from './home.component';
import { homeRouting } from './home.routing';
import { AuthService } from "./auth.service"
import { HttpModule } from '@angular/http';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        homeRouting
    ],
    declarations: [
        HomeComponent,
    ],
    providers: [
        AuthService
    ]
})
export class HomeModule {
}
