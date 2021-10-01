import {Component, Input, OnInit} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

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
  styleUrls: ['./block-navigation.component.scss']
})
export class BlockNavigationComponent implements OnInit {

  @Input()
  block: any;

  @Input()
  index: number;

  @Input()
  selectBlock: any;

  treeControl: FlatTreeControl<any>;
  treeFlattener: MatTreeFlattener<any, any>;
  dataSource: MatTreeFlatDataSource<any, any>;

  constructor() {
  }

  ngOnInit() {
    this.treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level, node => node.expandable);

    this.treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = [
      {
        name: this.block.label,
        children: this.block.form.segments.length > 1 ? this.block.form.segments.map((segment, index) => {
          segment.title = segment.title || `Segment ${index + 1}`;
          return {
            ...this.block,
            ...segment,
            name: segment.title,
            form: {
              ...this.block.form,
              segments: [
                segment
              ]
            }
          };
        }) : []
      }];
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  selectCustomBlock(node) {
    return this.block.form.segments.length > 1 ? this.selectBlock({
      ...node,
      value: this.block.value
    }, this.index) : this.selectBlock(this.block,this.index);
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
