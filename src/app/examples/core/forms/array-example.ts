import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const ARRAY_EXAMPLE: FormBuilderData = {
  value: {
    level1: [
      {
        name: 'Item 1',
        level2: [
          {
            name: 'Item 1 Level 2',
            level3: [
              {name: 'Item 1 Level 3'}
            ]
          }
        ]
      },
      {
        name: 'Item 2'
      },
      {
        name: 'Item 3',
        level2: [
          {
            name: 'Item 3 Level 2|1',
            level3: [
              {name: 'Item 3 Level 3|1'},
              {name: 'Item 3 Level 3|2'},
              {name: 'Item 3 Level 3|3'},
            ]
          },
          {
            name: 'Item 3 Level 2|2'
          }
        ]
      },
      {
        name: 'Item 4',
        level2: [
          {
            name: 'Item 4 Level 2|1',
            level3: [
              {name: 'Item 4 Level 3|1'},
              {name: 'Item 4 Level 3|2'},
              {name: 'Item 4 Level 3|3'},
              {
                name: 'Item 4 Level 3|4',
                level3: [
                  {name: 'Item 4 Level 4|1'},
                  {name: 'Item 4 Level 4|2'},
                  {name: 'Item 4 Level 4|3'},
                  {name: 'Item 4 Level 4|4'},
                ]
              },
            ]
          },
          {
            name: 'Item 4 Level 2|2',
            level3: [
              {name: 'Item 4 Level 3|1'},
              {name: 'Item 4 Level 3|2'},
              {name: 'Item 4 Level 3|3'},
              {
                name: 'Item 4 Level 3|4',
                level4: [
                  {name: 'Item 4 Level 4|1'},
                  {name: 'Item 4 Level 4|2'},
                  {name: 'Item 4 Level 4|3'},
                  {name: 'Item 4 Level 4|4'},
                ]
              },
            ]
          }
        ]
      }
    ]
  },
  schema: {
    properties: {
      level1: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {type: 'string'},
            level2: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {type: 'string'},
                  level3: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {type: 'string'},
                        level4: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: {type: 'string'}
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  segments: [
    {
      title: 'Level 1',
      array: '/level1',
      fields: ['/name'],
      nestedSegments: [
        {
          title: 'Level 2',
          array: '/level2',
          fields: ['/name'],
          nestedSegments: [
            {
              title: 'Level 3',
              array: '/level3',
              fields: ['/name'],
              nestedSegments: [
                {
                  title: 'Level 4',
                  array: '/level4',
                  fields: ['/name']
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
