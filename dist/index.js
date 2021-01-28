const REGEX_PARAM_DEFAULT = /^[^/]+/;
const REGEX_START_WITH_PARAM = /^(:\w|\()/;
const REGEX_INCLUDE_PARAM = /:\w|\(/;
const REGEX_MATCH_PARAM = /^(?::(\w+))?(?:\(([^)]+)\))?/;
class Router {
    constructor(routes) {
        this.root = this.createNode();
        if (routes) {
            Object.entries(routes).forEach(route => this.add(...route));
        }
    }
    createNode({ regex, param, handler } = {}) {
        return {
            regex,
            param,
            handler,
            children: {
                string: {},
                regex: {}
            }
        };
    }
    add(pattern, handler) {
        this.parseOptim(pattern, handler, this.root);
        return this;
    }
    parseOptim(remain, handler, node) {
        if (REGEX_INCLUDE_PARAM.test(remain)) {
            this.parse(remain, handler, node);
        }
        else {
            const child = node.children.string[remain];
            if (child) {
                child.handler = handler;
            }
            else {
                node.children.string[remain] = this.createNode({ handler });
            }
        }
    }
    parse(remain, handler, parent) {
        if (REGEX_START_WITH_PARAM.test(remain)) {
            const match = remain.match(REGEX_MATCH_PARAM);
            if (match) {
                let node = parent.children.regex[match[0]];
                if (!node) {
                    node = parent.children.regex[match[0]] = this.createNode({
                        regex: match[2] ? new RegExp('^' + match[2]) : REGEX_PARAM_DEFAULT,
                        param: match[1]
                    });
                }
                if (match[0].length === remain.length) {
                    node.handler = handler;
                }
                else {
                    this.parseOptim(remain.slice(match[0].length), handler, node);
                }
            }
        }
        else {
            const char = remain[0];
            let node = parent.children.string[char];
            if (!node) {
                node = parent.children.string[char] = this.createNode();
            }
            this.parse(remain.slice(1), handler, node);
        }
    }
    find(path) {
        return this.findOptim(path, this.root, {});
    }
    findOptim(remain, node, params) {
        const child = node.children.string[remain];
        if (child && child.handler !== undefined) {
            return {
                handler: child.handler,
                params
            };
        }
        return this.findRecursive(remain, node, params);
    }
    findRecursive(remain, node, params) {
        let child = node.children.string[remain[0]];
        if (child) {
            const result = this.findRecursive(remain.slice(1), child, params);
            if (result) {
                return result;
            }
        }
        for (const k in node.children.regex) {
            child = node.children.regex[k];
            if (child.regex) {
                const match = remain.match(child.regex);
                if (match) {
                    if (match[0].length === remain.length && child.handler !== undefined) {
                        if (child.param) {
                            params[child.param] = decodeURIComponent(match[0]);
                        }
                        return {
                            handler: child.handler,
                            params
                        };
                    }
                    else {
                        const result = this.findOptim(remain.slice(match[0].length), child, params);
                        if (result) {
                            if (child.param) {
                                params[child.param] = decodeURIComponent(match[0]);
                            }
                            return result;
                        }
                    }
                }
            }
        }
        return null;
    }
}
export default Router;
