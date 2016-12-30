import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';

import 'rxjs/Rx';

@Injectable()
export class AuthService {
    constructor(private http:Http) {
    }
    
    auth(code:string):Observable<{t:string}> {
        return this.http
            .get(`http://10.0.3.5:8300/auth?code=222`)
            .map((response) => response.json() as {t:string})
            .catch(this.handleError);
    }
    
    private handleError(error:any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        return Observable.throw(errMsg);
    }
}
