import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { ToastService } from '../toast.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  constructor(
    private toast: ToastService,
    public router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): import('rxjs').Observable<HttpEvent<any>> {
    const clientToken = localStorage.getItem('client-token');
    const accessToken = localStorage.getItem('access-token');

    if (clientToken) {
      req = req.clone({
        setHeaders: {
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${clientToken}`,
        },
        responseType: 'json',
      });
    }

    if (accessToken) {
      req = req.clone({
        setHeaders: {
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'json',
      });
    }

    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // Handle success response if needed
          }
        },
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this.notificationService.showInfoNotification("",'Session Timeout');
                // this.toast.showInfo("info", "Information", 'Session Timeout');
              this.router.navigate(['/login']);
            }
            // Handle other error responses if needed
          }
        }
      )
    );
  }
}
