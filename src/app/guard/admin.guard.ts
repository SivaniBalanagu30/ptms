import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild, CanDeactivate, CanLoad, Route, UrlSegment, UrlTree } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class AllPermissionGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {
    
    
    constructor(private router: Router) { }
  
    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let url: string = state.url;
      return this.checkUserLogin(next, url);
    }
    canActivateChild(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.canActivate(next, state);
    }
    canDeactivate(
      component: unknown,
      currentRoute: ActivatedRouteSnapshot,
      currentState: RouterStateSnapshot,
      nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return true;
    }
    canLoad(
      route: Route,
      segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
      return true;
    }
  
    checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {
      if (localStorage.getItem('access-token')) {
        if (route.data.role && !route.data.role.includes(localStorage.getItem('role'))) {
          this.router.navigate(['/login']);
          return false;
        } else {
            return true;
        }
      }
  
      this.router.navigate(['/login']);
      return false;
    }
  }