import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {FieldComponent, FieldData, Option} from '@jaspero/form-builder';

interface DragOptions extends Option {
  active?: boolean;
}

export interface DragConfiguration {
  toggle?: boolean;
  options: DragOptions[];
}

export type DragData = DragConfiguration & FieldData;

@Component({
  selector: 'fb-draggable-list',
  templateUrl: './draggable-list.component.html',
  styleUrls: ['./draggable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraggableListComponent extends FieldComponent<DragData> implements OnInit {

  findMethod: (option: string) =>
    (value: any) => boolean;

  options: Array<{
    name: string;
    value: any;
    active: boolean;
    disabled?: boolean;
  }>;

  ngOnInit() {

    this.findMethod = this.cData.toggle ? this.findWithToggle : this.findSimple;

    if (this.cData.control.value.length) {
      this.options = this.cData.options
        .map(option => {
          const control = this.cData.control.value.find(this.findMethod(option.value));

          return {
            ...option,
            active: control ? control.active : option.active ?? true
          }
        })
        .sort((optionOne, optionTwo) => {
          const indexOne = this.cData.control.value.findIndex(this.findMethod(optionOne.value));
          const indexTwo = this.cData.control.value.findIndex(this.findMethod(optionTwo.value));
          return indexTwo - indexOne;
        });

    } else {
      this.options = this.cData.options.map(it => ({
        ...it,
        active: it.active || true
      }));
    }
  }

  findSimple(search: string) {
    return (value: string) =>
      value === search
  }

  findWithToggle(search: string) {
    return (value: {value: string, active: boolean}) =>
      value.value === search
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.options,
      event.previousIndex,
      event.currentIndex
    );

    this.update();
  }

  toggleChange(index: number, value: MatCheckboxChange) {
    this.options[index].active = value.checked;
    this.update();
  }

  update() {
    this.cData.control.setValue(
      this.options.map(val =>
        this.cData.toggle ?
          {value: val.value, active: val.active} :
          val.value
      )
    );
  }
}
