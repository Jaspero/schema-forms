export interface StyleOptions {}

export function Style(options?: StyleOptions) {
  return type => {
    Object.defineProperty(type.prototype, 'style', {
      get: function () {
        return 'background: red';
      }
    });
  }
} 