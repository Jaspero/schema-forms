import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData,
  FormBuilderComponent,
  FormBuilderData,
  FormBuilderService
} from '@jaspero/form-builder';
import {of, Subscription} from 'rxjs';
import {startWith, switchMap} from 'rxjs/operators';

interface BlockData extends FieldData {
  selection: {
    [key: string]: {
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
    private service: FormBuilderService,
    private cdr: ChangeDetectorRef
  ) {
    super(cData);
  }

  @ViewChild(FormBuilderComponent, {static: false})
  formBuilderComponent: FormBuilderComponent;

  selection: {
    form: FormBuilderData;
    previewTemplate?: string;
    previewStyle?: string;
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

  ngOnDestroy() {
    this.service.saveComponents.splice(
      this.service.saveComponents.indexOf(this),
      1
    );
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
