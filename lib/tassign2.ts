/**
 * From [this issue](https://github.com/angular-redux/tassign/issues/1)
 * @param target
 * @param source
 */
export function tassign2<T, K extends keyof T>(target: T, ...source: Pick<T, K>[]): T
{
    return Object.assign({}, target, ...source);
}
