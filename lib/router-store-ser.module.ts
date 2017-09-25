import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { NavigationEffects } from './navigation.effects';
import { RouterStateSerializer } from '@ngrx/router-store';
import { RouterStateSerializer as CustomRouterStateSerializer } from './router-state-serializer';

/**
 * The module to import. It provides a custom [[RouterStateSerializer]] service
 * to serialize a [[RouterStateSnapshot]] to be used in the navigation actions payload.
 * This will be automatically catched by '@ngrx/router-store'.
 *
 * It also uses '@ngrx/effects' to setup an effect that navigates (using [[Router.navigate()]]) upon a navigation action.
 * Thus, for navigating in the application, one can dispatch the [[NavigationGoAction]] action.
 */
@NgModule({
    imports: [
        EffectsModule.forFeature([
            NavigationEffects
        ]),
    ],
    providers: [
        { provide: RouterStateSerializer, useClass: CustomRouterStateSerializer },
    ],
})
export class RouterStoreSerModule { }
