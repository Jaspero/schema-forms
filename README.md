[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![CircleCI](https://circleci.com/gh/Jaspero/schema-forms.svg?style=svg)](https://circleci.com/gh/Jaspero/schema-forms)
[![NPM Version](https://img.shields.io/npm/v/@jaspero/form-builder.svg)](https://www.npmjs.com/package/@jaspero/form-builder)

# @jaspero/form-builder

## Installation

To install this library, run:

```bash
$ npm install --save @jaspero/form-builder
```

### Provide services and values

1. Provide necessary services
  - StorageService - Used for storing files when `FileComponent`, `ImageComponent` or `GalleryComponent` are used.
  - DbService - Used for fetching referenced relations from your server in runtime
2. Provide necessary values
  - STORAGE_URL - Root URL for fetching files from your server
  - ROLE - Segments and fields can be conditionally shown/hidden if the value of the role
  matches what is expected in the schema
  
### Styles

In order to make the generated forms customizable, this library doesn't provide
any default styles. This means that the styles need to be loaded in the root of your application.
A good starting point are the example styles provided here.

## Composing Forms

### Definitions

This configuration is used for defining addition field based options. Changing the label or
what component is used to represent the field in the form. The `Definitions` interface looks like this:

| Property     | Type   | Description                                                                                                                                              | Default                                        |
| ------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| label        | string | Label of the field                                                                                                                                       | uses the name of the property                  |
| hint         | string | Shows a hint below the field if defined                                                                                                                  | -                                              |
| defaultValue | any    | What the value of the field should be if empty                                                                                                           | -                                              |
| component    | object | `{type: string, configuration: any}` - The `type` defines the field to use and the `configuration` is used for any additional component specific options | What ever is the default for the property type |

#### Component Types

| Name  | Selector | Description    | Configuration Options               |
| ----- | -------- | -------------- | ----------------------------------- |
| Input | input    | A simple input | `{type: 'text', 'number', 'email'}` |

#### Example

```JSON
{
  "name": {
    "label": "Name",
    "defaultValue": "John"
  },
  "age": {
    "label": "Age",
    "component": {
      "type": "slider"
    }
  }
}
```

### Adding custom fields

1. Create a new component that extends `FieldComponent`. You should inject `COMPONENT_DATA` in order to receive `FieldData`, most importantly the underlining `FormControl`.
2. Map the newly added component through the `CUSTOM_FIELDS` provider e.g. 
    ```ts
    providers: [{
        provide: CUSTOM_FIELDS
        useValue: {
            'new-component': NewComponent
        }
    }]
    ```
3. You can now use the new field in a forms `definitions`.

### Handling Array

The form builder supports both arrays of primitives and object arrays.

#### Object Arrays

The following is required to render an object array:

1. An object array defined in the schema:
    ```json
    {
      "addresses": {
       "type": "array",
       "items": {
         "type": "object",
         "properties": {
           "city": {
             "type": "string"
           },
           "address": {
             "type": "string"
           }
         }
       }
      }
    }
    ```
2. A dedicated segment with an array property:
    ```json
    {
      "segments": [{
        "array": "/addresses",
        "fields": [
          "/city",
          "/address"
        ] 
      }]
    }
    ```
3. You can also optionally define options for each field in the definitions:
    ```json
    {
      "definitions": {
        "addresses/city": {
          "label": "City"
        }  
      }    
    } 
    ```

#### Primitive Arrays

Primitive arrays can be displayed in two variations as a dedicated segment or
as a field. 

If the property is defined with out an `items` value. It's expected to be used as a field. 
In that case the following components can be used:

- **select** in combination with `{multiple: true}`
- **chips**
- **draggable-list**

If an items value is defined then it's expected to be rendered as its own segments.

## Plugins

### Official plugins

#### TinyMCE WYSIWYG Editor

This plugin registers a field `tinymce` for rendering the TinyMCE WYSIWYG Editor.

##### Set up

1. Install tinymce `npm i --save tinymce`
2. Add the following to the `assets` array in `angular.json`
    ```json
    {
        "glob": "**/*",
        "input": "node_modules/tinymce/themes/silver",
        "output": "/themes/silver"
    },
    {
        "glob": "**/*",
        "input": "node_modules/tinymce/skins/ui/oxide",
        "output": "/skins/ui/oxide"
    },
    {
        "glob": "**/*",
        "input": "node_modules/tinymce/skins/content/default",
        "output": "/skins/content/default"
    },
    {
        "glob": "**/*",
        "input": "node_modules/tinymce/plugins",
        "output": "/plugins"
    },
    {
        "glob": "**/*",
        "input": "node_modules/tinymce/icons",
        "output": "/icons"
    }
    ```
3. Add the tinymce script to the `scripts` array in `angular.json`
    `"./node_modules/tinymce/tinymce.min.js"`
4. You can optionally add/extend your commonjs dependencies whitelist to get rid of console warnings
    ```json
        "allowedCommonJsDependencies": [
          "json-pointer",
          "tinymce/plugins/wordcount",
          "tinymce/plugins/table",
          "tinymce/plugins/lists",
          "tinymce/plugins/print",
          "tinymce/plugins/link",
          "tinymce/plugins/image",
          "tinymce/plugins/imagetools",
          "tinymce/plugins/fullscreen",
          "tinymce/plugins/code",
          "tinymce/plugins/autolink",
          "tinymce/plugins/advlist"
        ]
    ``` 

#### Page Builder

## Development

### Creating a plugin

1. Run `ng g library [plugin-name]`
2. Add `@jaspero/` prefix in the projects `package.json`
3. Add a `release` property as well. Example from `tincymce` plugin.
    ```json
      "release": {
        "pkgRoot": "../../dist/@jaspero/fb-tinymce",
        "branch": "master",
        "verifyConditions": [
          "@semantic-release/changelog",
          "@semantic-release/npm",
          "@semantic-release/git"
        ],
        "prepare": [
          "@semantic-release/changelog",
          "@semantic-release/npm",
          "@semantic-release/git"
        ],
        "publish": [
          "@semantic-release/npm",
          [
            "@semantic-release/github",
            {
              "assets": [
                "dist/@jaspero/fb-tinymce"
              ]
            }
          ]
        ],
        "plugins": [
          "@semantic-release/commit-analyzer",
          "@semantic-release/release-notes-generator"
        ]
      }
    ```
4. Create `ng-package.prod.json` example from tinymce
    ```json
    {
      "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
      "dest": "../../dist/@jaspero/fb-tinymce",
      "lib": {
        "entryFile": "src/public-api.ts"
      }
    }
    ```
5. In `angular.json` extend the `architect.configurations.production` with `ng-package.prod.json`
    ```json
     "configurations": {
       "production": {
         "tsConfig": "projects/page-builder/tsconfig.lib.prod.json",
         "project": "projects/page-builder/ng-package.prod.json"
       }
    }
    ```
6. If you need to register fields do it in the plugins module like this:
    ```typescript
    export class TinymceModule {
      constructor(
        private ctx: FormBuilderContextService
      ) {
        this.ctx.registerField(
          'tinymce',
          TinymceComponent
        );
      }
    }
    ```
7. Add build scripts for the library in to the root `package.json`
8. Build the library and publish an initial version manually. This is required because since it's a scoped
package it needs to be explicitly flagged as public. You can do this by running `npm publish --access public` in `dist/@jaspero/[package-name]`.

## License

MIT © [Jaspero Ltd](mailto:info@jaspero.co)
