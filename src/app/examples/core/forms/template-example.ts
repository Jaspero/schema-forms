import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const TEMPLATE_EXAMPLE: FormBuilderData = {
  schema: {
    properties: {
      content: {type: 'string'}
    },
  },
  definitions: {
    content: {
      label: 'Content',
      component: {
        type: 'template-editor',
        configuration: {
          defaultTemplate: 'newsletter',
          templates: [
            {
              id: 'newsletter',
              layout: `<div class="main-content"></div>`,
              defaultSegments: ['intro'],
              style: `:focus{outline:2px dashed #e66439;outline-offset:4px}.body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";font-size:18px;font-weight:lighter;color:#09371f;background:#f3edd9}.footer-content,.header-content,.main-content{padding:3ch 2ch;max-width:52ch;margin:1ch auto}.main-content{background:#fff;border-radius:1ch;border:1px solid #cdd7d2}.footer-content>*{font-size:.875rem}.logo{display:block;margin:auto}section{border-left:4px solid #cdd7d2;padding:1px 0 1px 1em;margin:2em 0}hr{outline:0;border:none;border-top:1px dashed #cdd7d2;margin:2em 0}.button{display:block;margin:2ch 0;background:#e66439;color:#fff;font-size:.875rem;font-family:inherit;padding:1.5ch 2ch;border:none;border-radius:.5ch;cursor:pointer}.button:hover{outline:2px dashed #e66439;outline-offset:4px}.button:disabled{opacity:.5;pointer-events:none}h1,h2{font-family:"Iowan Old Style","Apple Garamond",Baskerville,"Times New Roman","Droid Serif",Times,"Source Serif Pro",serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";font-weight:inherit}h1{font-size:2rem;margin:.5em 0}h2{font-size:1.5rem;margin:.75em 0}h3{margin:.875em 0;font-size:1.125rem;font-weight:400}`,
              segments: [
                {
                  id: 'intro',
                  name: 'Intro',
                  content: `<h1>Dear {{FirstName}},</h1>`
                }
              ]
            }
          ]
        }
      }
    }
  }
};
