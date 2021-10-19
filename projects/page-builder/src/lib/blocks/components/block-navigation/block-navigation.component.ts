import {FlatTreeControl} from '@angular/cdk/tree';
import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {SegmentType} from '@jaspero/form-builder';

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface FoodNode {
  name: string;
  children?: FoodNode[];
}


/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'fb-pb-block-navigation',
  templateUrl: './block-navigation.component.html',
  styleUrls: ['./block-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockNavigationComponent implements OnInit {

  @Input() block: any;
  @Input() index: number;
  @Input() selectBlock: any;

  treeControl: FlatTreeControl<any>;
  treeFlattener: MatTreeFlattener<any, any>;
  dataSource: MatTreeFlatDataSource<any, any>;

  ngOnInit() {
    this.treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level, node => node.expandable);

    this.treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    console.log(this.block.form.segments);

    const children = (this.block.form.segments || []).map((segment, index) => {

      segment.type = SegmentType.Empty;

      // const child = {
      //   ...this.block,
      //   ...segment,
      //   name: segment.title,
      //   form: {
      //     ...this.block.form,
      //     segments: [
      //       segmentz
      //     ]
      //   }
      // };
      const child = {
        ...this.block,
        ...segment,
        name: segment.title || `Segment ${index + 1}`,
        form: {
          ...this.block.form,
          segments: this.block.form.segments.map((item, i) => {
            if (i === index) {
              return item;
            }
            return {...item, fields: []};
          })
        }
      };

      segment.title = '';

      console.log(child);

      // if (child.array) {
      //   child.form = {
      //     ...child.form,
      //     segments: [
      //       {
      //         fields: segment.fields
      //       }
      //     ],
      //     schema: child.form.schema.properties[child.array.slice(1)].items
      //   }
      //
      //   delete child.array;
      // }

      // console.log(JSON.parse(JSON.stringify(child)));

      return child;
    })

    this.dataSource.data = [{
      name: this.block.label,
      icon: this.block.icon,
      children
    }];
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  selectCustomBlock(node) {
    if ((this.block.form.segments || []).length > 1) {
      return this.selectBlock({...node, value: this.block.value}, this.index);
    }

    return this.selectBlock(this.block, this.index);
  }

  private _transformer = (node: FoodNode, level: number) => {
    return {
      ...node,
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level
    };
  };
}
