export const SCHEMA = {
  segments: [{
    fields: ['/meta']
  }],
  schema: {
    properties: {
      meta: {
        type: 'object',
        properties: {
          title: {type: 'string'},
          keywords: {type: 'string'},
          metadata: {type: 'string'}
        }
      }
    }
  },
  definitions: {
    meta: {component: {type: 'seo-editor'}}
  }
};
