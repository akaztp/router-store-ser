import { Injectable, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { RouterStateSerializer } from '@ngrx/router-store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/empty';
import { tassign2 } from './tassign2';

import { ACTION_NAVIGATION_GO, NavigationGoAction } from './navigation.actions';
import { RouterStateSerializer as CustomRouterStateSerializer } from './router-state-serializer';

/**
 * Implements the navigation command action as a side effect.
 */
@Injectable()
export class NavigationEffects
{
    @Effect()
    public effect$: Observable<Action> = this.actions$.ofType<NavigationGoAction>(ACTION_NAVIGATION_GO)
        .mergeMap(action =>
        {
            let route: ActivatedRoute = null;
            if (action.payload.relativeRouteId)
            {
                route = this.routerStateSerializer.findRouteById(this.router.routerState.root, action.payload.relativeRouteId);
                if (route)
                    this.router.navigate(
                        action.payload.commands,
                        tassign2(action.payload.extras, { relativeTo: route }));
                else
                    throw new Error('RouterStoreSerModule. NavigationEffects. Action: "' + ACTION_NAVIGATION_GO
                        + '" specified a route id which was not found on current activated route.');
            }
            else
            this.router.navigate(
                action.payload.commands,
                tassign2(action.payload.extras, { relativeTo: null }));

            return Observable.empty();
        });

    constructor(
        protected actions$: Actions,
        protected router: Router,
        @Inject(RouterStateSerializer)
        protected routerStateSerializer: CustomRouterStateSerializer,
    ) { }
}
