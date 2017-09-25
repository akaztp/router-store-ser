# Router-Store-Ser

An (sort of) extension to [@ngrx/router-store](https://github.com/ngrx/platform) providing router serialization and a navigation action. This allows for [ReduxDevTools](http://extension.remotedev.io/) time travel to work.

## Installation

On your project folder:

`npm install router-store-ser --save` 

## Usage


### Import the module

Import the `RouterStoreSerModule` into your app module:

```
import { RouterStoreSerModule } from 'router-store-ser';

@NgModule({
    imports: [
        CommonModule,
        StoreModule.forRoot(reducers),
        EffectsModule.forRoot([
            PageStartEffects
        ]),
        StoreRouterConnectingModule,
        RouterStoreSerModule,
    ]})
```

Note that `RouterStoreSerModule` depends on `@ngrx/router-store` wich depends on the Store module from `@ngrx/store`.
Also the `RouterStoreSerModule` declares an `EffectsModule.forChild()` so there must be a `.forRoot()`.

At this point, the action ROUTER_NAVIGATION of @ngrx/router-store now has the payload simplified (comparing to its default implementation):

```
{
    type: ROUTER_NAVIGATION,
    payload: {
        routerState: {
            url: '/start',
            root: {
                configPath: 'start',
                data: {
                    uid: '3e412cfd-a338-4b6a-ac88-9a41fb700f73'
                },
                params: {},
                children: [ ]
            }
        }
        event: ...
    }
}
```
This `routerState` serialization can be extended by creating a new class that extends this module's `RouterStateSerializer` and providing it.

### Configure the Routes

Mark configured routes needed to be later referred to with some (app wide unique) id:

```
export const startRouteId = '3e412cfd-a338-4b6a-ac88-9a41fb700f73';
export const endRouteId = '352951ae-8057-4d39-81d1-d46ab3b9c5bd';

const appRoutes: Routes = [
    {
        path: 'start',
        component: StartContainer,
        data: {
            uid: startRouteId,
        }
    },
    {
        path: 'end',
        component: EndContainer;
        data: {
            uid: endRouteId
        }
    },
];
```

The parameter name "uid" can be customize by providing a string with `DataPropertyToken`:

```
import { DataPropertyToken } from 'router-state-serializer';

@NgModule({
    providers: [
        { provide: DataPropertyToken, useValue: 'myid' }
]})
```

At this point, the routes can be searched using the action payload. The following example is an effect that make the app navigate apon detecting a `ROUTER_NAVIGATION` action for some specific route:

```
import { ROUTER_NAVIGATION, RouterNavigationAction, RouterStateSerializer } from '@ngrx/router-store';
import { RouterStateSerializer as CustomRouterStateSerializer, RouterStateSer, NavigationGoAction } from 'router-store-ser';

import { startRouteId } from './app-routing.module';

@Injectable()
export class StartEffects
{
    @Effect()
    public effect$: Observable<Action>;

    constructor(
        protected actions$: Actions,
        @Inject(RouterStateSerializer)
        protected routerStateSerializer: CustomRouterStateSerializer
    )
    {
        this.effect$ = this.actions$.ofType<RouterNavigationAction<RouterStateSer>>(ROUTER_NAVIGATION)
            .filter(action => !!this.routerStateSerializer.findNodeById(
                action.payload.routerState.root, startRouteId))
            .map(action =>
            {
                return new NavigationGoAction({
                    commands: ['../continue'],
                    relativeRouteId: startRouteId
                    })
            });
    }
}
```

There is also available a function to search an Angular `ActivatedRoute`  for a route with a specified id:

```
this.routerStateSerializer.findRouteById(this.router.routerState.root, startRouteId)
```

### Dispatching a NavigationGoAction

This action make the Angular router to navigate. Check Router.navigate() reference on [Angular docs](https://angular.io/api/router/Router#navigate). This way app navigation can be accomplished in effects.

This example acomplishes a relative navigation, referring to the configured route with the specified id:
```
this.store.dispatch(new NavigationGoAction({
    commands: ['../question', 1],
    relativeRouteId: startRouteId
}));
```

## Contributing

Contributions and issues are welcome.

Testing and linting scripts are provided:

`npm run test`

`npm run lint`
