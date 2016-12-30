import { Component, OnInit } from '@angular/core';
import { AuthService } from "./auth.service";
import { Router, ActivatedRoute } from '@angular/router';
@Component({
    templateUrl: './home.html'
})

export class HomeComponent implements OnInit {
    code:string;
    
    constructor(private authService:AuthService, private route:ActivatedRoute, private router: Router) {
    }
    
    ngOnInit() {
        this.code = this.route
            .snapshot
            .queryParams['code'];
        if (this.code) {
            this.authService.auth(this.code).subscribe((data) => {
                console.log(data);
                this.router.navigate(['/list', data.t]);
            }, (error) => console.log(error));
        }
    }
}
