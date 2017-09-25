import { Action } from '@ngrx/store';
import { NavigationExtras } from '@angular/router';

/**
 * The action type for dispatching a router navigation command.
 */
export const ACTION_NAVIGATION_GO = 'NAVIGATION_GO';

/**
 * The action for dispatching a router navigation command.
 */
export class NavigationGoAction implements Action
{
    readonly type = ACTION_NAVIGATION_GO;
    constructor(
        public payload: {
            /**
             * The same commands for angular Router.navigate()
             */
             commands: Array<any>;
             /**
              * Specify a route id for making the commands relative to that route.
              */
             relativeRouteId?: any;
             /**
              * The same angular NavigationExtras. Note that parameter "relativeTo" has no effect. Use [[relativeRouteId]].
              */
             extras?: NavigationExtras;
        }
    ) { }
}
