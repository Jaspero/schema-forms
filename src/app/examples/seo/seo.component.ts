import {Component, OnInit} from '@angular/core';
import {SCHEMA} from './schema.const';

@Component({
  selector: 'sc-seo',
  templateUrl: './seo.component.html',
  styleUrls: ['./seo.component.scss']
})
export class SeoComponent implements OnInit {
  constructor() { }

  example = SCHEMA;

  ngOnInit(): void {
  }

}
