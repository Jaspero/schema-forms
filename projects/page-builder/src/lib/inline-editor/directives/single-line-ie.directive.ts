import {Component, ElementRef, Input, NgZone, OnInit, Optional, ViewEncapsulation} from '@angular/core';
import {FormBuilderContextService, Parser} from '@jaspero/form-builder';
import {UntilDestroy} from '@ngneat/until-destroy';
import {Toolbar, ToolbarService} from '../../toolbar.service';
import {getControl} from '../../utils/get-control';
import {tinyInstance} from '../tinymce-obs';

interface Options {
  formId?: string;
  array?: string;
  index?: number;
  pointer: string;
  toolbar?: string[];
}

@UntilDestroy()
@Component({
  // tslint:disable-next-line:component-selector
  selector: '[fbPbSingleLineIE]',
  template: '',
  styleUrls: ['./toolbar.scss'],
  encapsulation: ViewEncapsulation.None
})
// tslint:disable-next-line:component-class-suffix
export class SingleLineIEDirective implements OnInit {
  constructor(
    private el: ElementRef,
    @Optional()
    private toolbarService: ToolbarService,
    @Optional()
    private formCtx: FormBuilderContextService,
    private zone: NgZone
  ) {
  }

  @Input('fbPbSingleLineIE')
  entryOptions: Options;
  defaultOptions = {
    toolbar: [
      'undo redo | bold italic underline | formatselect | link',
      'forecolor backcolor emoticons | alignleft aligncenter alignright alignfull | numlist bullist outdent indent'
    ]
  };
  lastTarget: HTMLElement;
  options: Options;
  toolbar: Toolbar;
  id: string;
  pointer: string;
  activeCls = 'pb-t-active';

  get htmlEl() {
    return this.el.nativeElement;
  }

  get iFrame() {
    return (document.querySelector('#fb-pb-iframe') as HTMLIFrameElement);
  }

  get host() {
    return this.htmlEl.closest('fb-pb-block');
  }

  get index() {
    return [...this.host.parentElement?.children || []].indexOf(this.host);
  }

  get control() {
    return getControl(
      this.id,
      this.index,
      this.pointer,
      this.options.array,
      this.options.index
    );
  }

  ngOnInit() {

    if (!this.toolbarService) {
      return;
    }

    this.options = {
      ...this.defaultOptions,
      ...this.entryOptions
    };

    this.id = this.options.formId || this.formCtx.module || 'jp-fb-main';
    this.pointer = Parser.standardizeKeyWithSlash(this.options.pointer);

    if (this.options.array) {
      this.pointer = this.options.array + this.pointer;
    }

    tinyInstance(this.iFrame)
      .subscribe(value =>
        value.init({
          target: this.htmlEl,
          menubar: false,
          inline: true,
          paste_as_text: true,
          plugins: [
            'link',
            'lists',
            'autolink',
            'emoticons'
          ],
          toolbar: this.options.toolbar,
          setup: (editor: any) => {
            editor.on('keyup change', () =>
              this.zone.run(() =>
                this.control.setValue(editor.getContent(), {onlySelf: true})
              )
            );
          }
        })
          .catch()
      );
  }
}
