import {FlatTreeControl} from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {TranslocoService} from '@ngneat/transloco';
import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

interface ParentNode {
  name: string;
  children?: ParentNode[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'fb-pb-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NavigationComponent {
  constructor(
    private transloco: TranslocoService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  @ViewChild('itemOptions') itemOptionsRef: TemplateRef<any>;
  @ViewChild('blockOptions') blockOptionsRef: TemplateRef<any>;

  optionsDialog: MatDialogRef<any>;

  @Input() index: number;
  @Input() selectBlock: any;
  @Input() closeBlock: any;
  @Input() removeBlock: any;
  @Input() addBlock: any;
  @Input() preview: any;

  treeControl: FlatTreeControl<any>;
  treeFlattener: MatTreeFlattener<any, any>;
  dataSource: MatTreeFlatDataSource<any, any>;

  valueCache: any;
  blockCache: any;

  selectLastItem = false;

  @Input()
  set value(value: any) {

    if (this.valueCache) {
      this.populateNavigation({
        ...this.blockCache,
        value
      });

      this.treeControl.expandAll();
    }

    this.valueCache = value;
  }

  @Input()
  set block(block: any) {
    this.blockCache = block;

    this.populateNavigation(block);
  }

  @Output()
  optionsChanged = new EventEmitter<any>();

  @Output()
  blockSelected = new EventEmitter<number>();

  populateNavigation(block) {
    if (!this.treeControl) {
      this.treeControl = new FlatTreeControl<FlatNode>(
        node => node.level, node => node.expandable);
    }

    if (!this.treeFlattener) {
      this.treeFlattener = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.children);
    }

    if (!this.dataSource) {
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    }

    const children = (block.form.segments || []).map((segment, index) => {
      if (!segment.type || segment.type === 'card') {
        segment.type = 'empty';
      }

      let child = {
        ...block,
        ...segment,
        name: segment.title,
        form: {
          ...block.form,
          segments: block.form.segments.filter((item, i) => i === index)
        }
      };

      if (child.array) {
        const arrayProperty = child.array.slice(1);
        child.form = {
          ...child.form,
          segments: [
            {
              type: 'empty',
              fields: segment.fields,
              ...segment.nestedSegments && {
                nestedSegments: segment.nestedSegments
              }
            }
          ],
          schema: child.form.schema.properties[arrayProperty].items,
          definitions: {
            ...Object.keys(child.form.definitions || {}).reduce((acc, key) => {
              if (key.startsWith(child.array) || key.startsWith(arrayProperty)) {
                /**
                 * Removes the parent array from the definitions
                 */
                const eKey = key.split('/').slice(1).join('/');
                acc[eKey] = child.form.definitions[key];
              }

              return acc;
            }, {})
          }
        };

        delete child.array;

        const addButton = {
          ...child,
          name: this.transloco.translate('fbPb.ADD') + ' ' + this.parseTitle(child.title) || child.label,
          button: true,
          icon: 'add_circle_outline',
          class: 'navigation-button',
          action: 'add',
          arrayProperty,
          value: {}
        };

        child = (child.value?.[arrayProperty] || []).map((item, i) => {
          return {
            ...child,
            name: this.parseTitle(child.title, i) || child.label,
            value: child.value?.[arrayProperty]?.[i],
            nested: {
              arrayProperty,
              index: i
            }
          };
        });

        if (this.selectLastItem) {
          this.selectLastItem = false;
          setTimeout(() => this.selectCustomBlock(child[child.length - 2]));
        }

        child.push(addButton);
      }

      return child;
    })
      .reduce((acc, child: Array<any> | object) =>
        [...acc, ...(child.constructor === Array ? child : [child])], []
      );

    this.dataSource.data = [{
      name: block.label,
      icon: block.icon,
      children
    }];
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  selectCustomBlock(node) {
    if (node.button) {
      if (node.action === 'add') {
        this.blockCache.value[node.arrayProperty] = [
          ...(this.blockCache.value[node.arrayProperty] || []),
          {}
        ];

        this.valueCache = this.blockCache;

        this.selectBlock({
          ...node,
          nested: {
            ...node.nested,
            completeValue: this.valueCache,
            arrayProperty: node.arrayProperty,
            index: this.blockCache.value[node.arrayProperty].length - 1
          },
          value: {}
        }, this.index);

        setTimeout(() => {
          this.optionsChanged.next(this.blockCache.value);

          this.selectLastItem = true;

          setTimeout(() => this.preview(), 50);
        });
      }

      return;
    }

    if (node.nested) {
      return this.selectBlock({
        ...node,
        nested: {
          ...node.nested,
          completeValue: this.valueCache
        },
        value: {
          ...this.blockCache.value[node.nested.arrayProperty][node.nested.index]
        }
      }, this.index);
    }

    if (node.expandable) {
      return this.selectBlock({
        ...this.blockCache,
        ...node
      }, this.index);
    }

    this.blockSelected.emit(this.index);

    if ((this.blockCache.form.segments || []).length > 1) {
      return this.selectBlock({...node, value: this.blockCache.value}, this.index);
    }

    return this.selectBlock(this.blockCache, this.index);
  }

  selectParent(node, nd) {
    if (nd.ariaExpanded === 'false' || !node.children?.length) {
      return;
    }

    const selectable = node.children.find(child => !child.action);

    if (selectable) {
      this.selectCustomBlock(selectable);
    }
  }

  openOptions(event, block, isBlock = false) {
    event.preventDefault();
    event.stopPropagation();

    if (!block.expandable) {
      this.selectCustomBlock(block);
    }

    this.optionsDialog = this.dialog.open(isBlock ? this.blockOptionsRef : this.itemOptionsRef, {
      autoFocus: false,
      position: {
        top: event.clientY + 'px',
        left: event.clientX + 'px'
      },
      backdropClass: 'clear-backdrop',
      panelClass: 'contextmenu-dialog',
      width: '140px',
      data: {block}
    });
  }

  deleteItem(block: any) {
    if (block.nested) {

      this.blockCache.value[block.nested.arrayProperty].splice(block.nested.index, 1);
      this.blockCache.value[block.nested.arrayProperty] = [...this.blockCache.value[block.nested.arrayProperty]];
      this.valueCache = this.blockCache;

      setTimeout(() => {
        this.optionsChanged.next(this.blockCache.value);
        setTimeout(() => this.closeBlock());
      });
    } else {
      this.deleteBlock(block);
    }

    this.optionsDialog.close();
  }

  deleteBlock(block: any) {
    this.selectCustomBlock(block);
    this.removeBlock();
    this.optionsDialog.close();
  }

  duplicateBlock(block: any) {
    const duplicate = {
      ...this.blockCache,
      ...block,
      duplicateValue: this.valueCache,
      id: this.blockCache.type,
      name: this.blockCache.name
    };

    this.addBlock(duplicate);
    this.optionsDialog.close();
  }

  drop(event: CdkDragDrop<any[]>) {
    const items = event.container.getSortedItems().map(item => item.data);
    const leftBound = items.findIndex(item => item.nested?.arrayProperty === event.item.data.nested.arrayProperty);
    const rightBound = items.findIndex((item, i) => i >= leftBound && item?.action === 'add') - 1;

    if (event.currentIndex < leftBound || event.currentIndex > rightBound) {
      return;
    }

    moveItemInArray(
      this.blockCache.value[event.item.data.nested.arrayProperty],
      event.previousIndex - leftBound,
      event.currentIndex - leftBound
    );

    this.optionsChanged.next(this.blockCache.value);
    setTimeout(() => {
      this.preview();
      this.cdr.markForCheck();
    });
  }

  sorted() {
    this.closeBlock();
  }

  parseTitle(title: string | ((_) => string), index?) {
    if (typeof title === 'function') {
      return title(index);
    }
    return title;
  }

  private _transformer = (node: ParentNode, level: number) => {
    return {
      ...node,
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level
    };
  };
}
