import { Component, ChangeDetectionStrategy, HostBinding, Input, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fb-pb-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockComponent implements OnInit {
  constructor(
    public el: ElementRef
  ) {}

  @HostBinding('id')
  @Input()
  id: number;

  @Input() styles: string[];

  @HostBinding('class.selected')
  @Input()
  selected: boolean;

  ngOnInit() {
    if (this.styles) {
      this.styles.forEach(style => {
        const el = document.createElement('style');
        el.innerHTML = style;
        this.el.nativeElement.appendChild(el);
      })
    }
  }

  change() {
    if (this.el.nativeElement.children[0]) {
      this.el.nativeElement.children[0].change = {};
    }
  }
}
