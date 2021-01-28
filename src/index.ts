const REGEX_PARAM_DEFAULT = /^[^/]+/;
const REGEX_START_WITH_PARAM = /^(:\w|\()/;
const REGEX_INCLUDE_PARAM = /:\w|\(/;
const REGEX_MATCH_PARAM = /^(?::(\w+))?(?:\(([^)]+)\))?/;

type Node<T> = {
  regex?: RegExp,
  param?: string,
  handler?: T,

  children: {
    string: Record<string, Node<T>>,
    regex: Record<string, Node<T>>
  }
};

type ResultParams = Record<string, string>;

type Result<T> = {
  handler: T,
  params: Record<string, string>
};

class Router<T> {
  private root: Node<T>

  constructor(routes?: Record<string, T>) {
    this.root = this.createNode();

    if (routes) {
      Object.entries(routes).forEach(route => this.add(...route));
    }
  }

  private createNode(
    {
      regex,
      param,
      handler
    }: {
      regex?: RegExp,
      param?: string,
      handler?: T
    } = {}
  ): Node<T> {
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

  add(pattern: string, handler: T): this {
    this.parseOptim(pattern, handler, this.root);
    return this;
  }

  private parseOptim(remain: string, handler: T, node: Node<T>) {
    if (REGEX_INCLUDE_PARAM.test(remain)) {
      this.parse(remain, handler, node);
    } else {
      const child = node.children.string[remain];

      if (child) {
        child.handler = handler;
      } else {
        node.children.string[remain] = this.createNode({ handler });
      }
    }
  }

  private parse(remain: string, handler: T, parent: Node<T>) {
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
        } else {
          this.parseOptim(remain.slice(match[0].length), handler, node);
        }
      }
    } else {
      const char = remain[0];
      let node = parent.children.string[char];

      if (!node) {
        node = parent.children.string[char] = this.createNode();
      }

      this.parse(remain.slice(1), handler, node);
    }
  }

  find(path: string): Result<T> | null {
    return this.findOptim(path, this.root, {});
  }

  private findOptim(remain: string, node: Node<T>, params: ResultParams): Result<T> | null {
    const child = node.children.string[remain];

    if (child && child.handler !== undefined) {
      return {
        handler: child.handler,
        params
      };
    }

    return this.findRecursive(remain, node, params);
  }

  private findRecursive(remain: string, node: Node<T>, params: ResultParams): Result<T> | null {
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
          } else {
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
