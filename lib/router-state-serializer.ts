import { OpaqueToken, Inject, Optional } from '@angular/core';
import { RouterStateSnapshot, Params, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { RouterStateSerializer as OriginalRouterStateSerializer } from '@ngrx/router-store';

/**
 * An injectable string to use as the property name for storing uid in route objects' data object.
 */
export const DataPropertyToken = new OpaqueToken('DataPropertyToken');

/**
 * The interface for objects in payload.routerState for the navigation actions.
 * On every reference to [[RouterReducerState]] use [[RouterReducerState<RouterStateSer>]] to overwrite
 * default state interface on '@ngrx/router-store'.
 */
export interface RouterStateSer
{
    url: string;
    root: RouterNodeSer;
}

/**
 * Router state level object for constructing the corresponding tree from [[ActivatedRouteSnapshot]].
 */
export class RouterNodeSer
{
    constructor(
        /**
         * Children of this level.
         */
        public children: Array<RouterNodeSer>,
        /**
         * The path configured in the route declaration.
         */
        public configPath: string,
        /**
         * The params from [[ActivatedRouteSnapshot]].
         */
        public params: Params,
        /**
         * The data from [[ActivatedRouteSnapshot]]. Make sure this object fully is serializable.
         */
        public data: any,
    ) { }

    /**
     * Create a tree of [[RouterNodeSer]] from an angular [[ActivatedRouteSnapshot]].
     * @param routerState
     */
    public static CreateFromState(routerState: ActivatedRouteSnapshot): RouterNodeSer
    {
        return new RouterNodeSer(
            routerState.children.map(RouterNodeSer.CreateFromState),
            routerState.routeConfig ? routerState.routeConfig.path : null,
            routerState.params,
            routerState.data,
        );
    }
}

/**
 * The serializer to feed to '@ngrx/router-store' by providing it to the global injector.
 * The class can be extended to serialize more data from the router states.
 */
export class RouterStateSerializer implements OriginalRouterStateSerializer<RouterStateSer>
{
    /**
     * Serializes a [[RouterStateSnapshot]] to be used in the navigation actions payload.
     * @param routerState The [[RouterStateSnapshot]] to serialize.
     */
    public serialize(routerState: RouterStateSnapshot): RouterStateSer
    {
        // Only return the minimum needed and serializable object instead of the entire snapshot
        return {
            url: routerState.url,
            root: RouterNodeSer.CreateFromState(routerState.root),
        };
    }

    /**
     * Utility function to find an [[ActivatedRoute]] by specifing a id. The same id, specified when configuring the routes.
     * @param state A root [[ActivatedRoute]] to start looking for the [[uid]].
     * @param uid An id to locate an [[ActivatedRoute]] in the tree specified by [[state]].
     * The same id, specified when configuring the routes.
     */
    public findRouteById(state: ActivatedRoute, uid: any): ActivatedRoute
    {
        if (!state || (state.snapshot.data && state.snapshot.data[this.dataProperty] === uid))
            return state;

        return (state.children || []).reduce((prev, s) => {
            // console.log('findRoutebyId. prev(path), prev(data), s(path), s(data): ',
            //     prev.snapshot.routeConfig.path,
            //     prev.snapshot.data,
            //     s.snapshot.routeConfig.path,
            //     s.snapshot.data);
            return prev || this.findRouteById(s, uid);
        }, null);
    }

    /**
     * Utility function to find a [[RouterNodeSer]] by specifing a id. The same id, specified when configuring the routes.
     * @param node A root [[RouterNodeSer]] to start looking for the [[uid]].
     * @param uid An id to locate an [[RouterNodeSer]] in the tree specified by [[node]].
     * The same id, specified when configuring the routes.
     */
    public findNodeById(node: RouterNodeSer, uid: any | Array<any>): RouterNodeSer
    {
        if (!node)
            return null;
        if (Array.isArray(uid))
        {
            if (node.data && uid.indexOf(node.data[this.dataProperty]) >= 0)
                return node;
        }
        else if (node.data && uid === node.data[this.dataProperty])
            return node;

            return (node.children || []).reduce((prev, l) =>
            {
                return prev || this.findNodeById(l, uid);
        }, null);
    }

    constructor(
        /**
         * The name of the property where the uid's are stored, on configured [[route.data]] objects. If not found it defaults to 'uid'.
         */
        @Inject(DataPropertyToken) @Optional()
        public dataProperty: string
    )
    {
        if (!this.dataProperty)
        this.dataProperty = 'uid';
     }
}
