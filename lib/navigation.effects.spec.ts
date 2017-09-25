import { TestBed } from '@angular/core/testing';
import { NavigationExtras, Router } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { EffectsModule } from '@ngrx/effects';
import { hot } from 'jasmine-marbles';
import { Observable } from 'rxjs/Observable';

import { tassign2 } from './tassign2';
import { NavigationEffects } from './navigation.effects';
import { NavigationGoAction, ACTION_NAVIGATION_GO } from './navigation.actions';
import { DataPropertyToken } from './router-state-serializer';
import { RouterStoreSerModule } from './router-store-ser.module';

describe('RouterStoreSer/NavigationEffects', () =>
{
    let effects: NavigationEffects;
    let actions: Observable<any>;
    let router: {
        routerState: { root: any };
        navigate: (commands: any[], extras?: NavigationExtras) => Promise<boolean>;
    } = null;

    const dataProperty = 'id';
    const routeId = '01';
    const route = {
        children: [],
        snapshot: { data: { [dataProperty]: routeId } }
    };


    beforeEach(() =>
    {
        router = jasmine.createSpyObj('Router', ['navigate', 'routerState']);
        router.routerState = {
            root: {
                children: [
                    {
                        children: [],
                        snapshot: { data: { [dataProperty]: routeId + 'off' } }
                    },
                    route
                ],
                snapshot: { data: {} }
            }
        };

        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot<{}, { type: any }>({}, {}),
                EffectsModule.forRoot([]),
                RouterStoreSerModule
            ],
            providers: [
                NavigationEffects,
                provideMockActions(() => actions),
                { provide: Router, useValue: router },
                { provide: DataPropertyToken, useValue: dataProperty }
            ]
        });

        effects = TestBed.get(NavigationEffects);
    });


    it('should not emit actions nor navigate', () =>
    {
        // append 'off' to make sure it is a different action from ACTION_NAVIGATION_GO
        actions = hot('a', { a: { type: ACTION_NAVIGATION_GO + 'off' } });
        const expected = hot('', {});

        expect(effects.effect$).toBeObservable(expected);
        expect(router.navigate).not.toHaveBeenCalled();
    });


    it('should navigate to an absolute route', () =>
    {
        const action: NavigationGoAction = {
            type: ACTION_NAVIGATION_GO,
            payload: {
                commands: ['abc'],
                relativeRouteId: null,
                extras: { replaceUrl: true }, // just a dummy object
            },
        };

        actions = hot('a', { a: action });
        const expected = hot('', {});

        expect(effects.effect$).toBeObservable(expected);
        expect(router.navigate).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(
            action.payload.commands,
            tassign2(action.payload.extras, { relativeTo: null }));
    });


    it('should navigate to a relative route', () =>
    {
        const action: NavigationGoAction = {
            type: ACTION_NAVIGATION_GO,
            payload: {
                commands: ['abc'],
                relativeRouteId: route.snapshot.data[dataProperty],
                extras: { replaceUrl: true }, // just a dummy object
            },
        };

        actions = hot('a', { a: action });
        const expected = hot('', {});

        expect(effects.effect$).toBeObservable(expected);
        expect(router.navigate).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(
            action.payload.commands,
            tassign2(action.payload.extras, { relativeTo: route as any }));
    });


    it('should error if specified route id is not found', () =>
    {
        const action: NavigationGoAction = {
            type: ACTION_NAVIGATION_GO,
            payload: {
                commands: ['abc'],
                relativeRouteId: route.snapshot.data[dataProperty] + 'other', // make sure the id is not found
                extras: { replaceUrl: true }, // just a dummy object
            },
        };

        actions = hot('a', { a: action });
        const expected = hot(
            '#',
            null,
            new Error('RouterStoreSerModule. NavigationEffects. Action: "' + ACTION_NAVIGATION_GO
                + '" specified a route id which was not found on current activated route.'));

        expect(effects.effect$).toBeObservable(expected);
        expect(router.navigate).not.toHaveBeenCalled();
    });

});
