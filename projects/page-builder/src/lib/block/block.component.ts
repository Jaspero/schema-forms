import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  Inject, NgModule,
  OnDestroy,
  OnInit, Optional,
  ViewChild, ViewContainerRef
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData,
  FormBuilderComponent, FormBuilderData,
  FormBuilderService
} from '@jaspero/form-builder';
import {of, Subscription} from 'rxjs';
import {startWith, switchMap} from 'rxjs/operators';
import {FbPageBuilderOptions} from '../options.interface';
import {FB_PAGE_BUILDER_OPTIONS} from '../options.token';

interface BlockData extends FieldData {
  selection: {[key: string]: {
      form: FormBuilderData,
      preview?: string
    }
  }
}

@Component({
  selector: 'fb-pb-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockComponent extends FieldComponent<BlockData> implements OnInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA)
    public cData: BlockData,
    @Optional()
    @Inject(FB_PAGE_BUILDER_OPTIONS)
    private options: FbPageBuilderOptions,
    private service: FormBuilderService,
    private cdr: ChangeDetectorRef,
    private compiler: Compiler
  ) {
    super(cData);
  }

  @ViewChild('el', {static: true, read: ViewContainerRef})
  vc: ViewContainerRef;

  @ViewChild(FormBuilderComponent, {static: false})
  formBuilderComponent: FormBuilderComponent;

  selection: {
    form: FormBuilderData,
    preview?: string
  };

  private typeListener: Subscription;

  ngOnInit() {
    const typeControl = this.cData.control.parent.get('type') as FormControl;

    this.typeListener = typeControl.valueChanges
      .pipe(
        startWith(typeControl.value)
      )
      .subscribe(value => {
        this.selection = this.cData.selection[value];
        if (this.selection) {
          this.selection.form.value = this.cData.control.value;
        }
        this.cdr.markForCheck();
      });

    this.service.saveComponents.push(this);
  }

  preview() {
    const tmpCmp = Component({template: this.selection.preview})(class {});
    const tmpModule = NgModule({
      declarations: [tmpCmp],
      imports: [
        CommonModule,
        ...(this.options && this.options.previewModules) || []
      ]
    })(class A { });

    this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        const f = factories.componentFactories[0];
        this.vc.clear();
        const cmpRef = this.vc.createComponent(f);
        cmpRef.instance.data = this.formBuilderComponent.form.getRawValue();
      });
  }

  ngOnDestroy() {
    this.typeListener.unsubscribe();
  }

  save(moduleId: string, documentId: string) {

    return this.formBuilderComponent.save(
      moduleId,
      documentId
    )
      .pipe(
        switchMap(() => {
          if (this.formBuilderComponent) {
            this.cData.control.setValue(this.formBuilderComponent.form.getRawValue());
          } else {
            this.cData.control.setValue({});
          }

          return of(true);
        })
      )
  }
}
