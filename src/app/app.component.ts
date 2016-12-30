import { Component, HostBinding } from '@angular/core';
@Component({
    selector: 'kubik-app',
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
    @HostBinding('class') componentClass:string = 'kubik-app';
}
