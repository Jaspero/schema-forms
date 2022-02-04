export const STATE: {
  renderMode: boolean;
  registered: {[key: string]: boolean};
  blocks: {
    [key: string]: {
      [key: string]: any;
    }
  }
} = {
  renderMode: false,
  registered: {},
  blocks: {}
};
