import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {Option} from '../../interfaces/option.inteface';

interface DragData extends FieldData {
  options: Option[];
}

@Component({
  selector: 'fb-draggable-list',
  templateUrl: './draggable-list.component.html',
  styleUrls: ['./draggable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraggableListComponent extends FieldComponent<DragData>
  implements OnInit {
  ngOnInit() {
    if (this.cData.control.value.length) {
      this.cData.options.sort((optionOne, optionTwo) => {
        const indexOne = this.cData.control.value.indexOf(optionOne);
        const indexTwo = this.cData.control.value.indexOf(optionTwo);
        return indexTwo - indexOne;
      });
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.cData.options,
      event.previousIndex,
      event.currentIndex
    );

    this.cData.control.setValue(
      this.cData.options.map(val => {
        return val.value;
      })
    );
  }
}
