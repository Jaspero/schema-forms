[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![CircleCI](https://circleci.com/gh/Jaspero/form-builder.svg?style=svg)](https://circleci.com/gh/Jaspero/form-builder)
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
  - DbService - Used for fetching reference relations from your server in runtime
2. Provide necessary values
  - STORAGE_URL - Root URL for fetching files from your server
  - ROLE - Segments and fields can be conditionally shown/hidden if the value of the role
  matches what is expected in the schema

### Third party dependencies

__tinymce__: A WYSIWYG editor. 

1. Install tinymce `npm i --save tinymce`
2. Add the following to the `assets` array in `angular.json`
```
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
}
```
3. Add the tinymce script to the `scripts` array in `angular.json`
`"./node_modules/tinymce/tinymce.min.js"`

### Styles

In order to make the generated forms customizable, this library doesn't provide
any default styles. This means that the styles need to be loaded in the root of your application.
A good starting point are the example styles provided here.

## License

MIT © [Jaspero Ltd](mailto:info@jaspero.co)
