declare type Route<T> = [string, T];
declare type Result<T> = {
    handler: T;
    params: Record<string, string>;
};
declare class Router<T> {
    private root;
    constructor(routes?: Route<T>[]);
    private createNode;
    add(pattern: string, handler: T): this;
    private parseOptim;
    private parse;
    find(path: string): Result<T> | null;
    private findOptim;
    private findRecursive;
}
export default Router;
