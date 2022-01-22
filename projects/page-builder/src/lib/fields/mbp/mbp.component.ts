import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {COMPONENT_DATA, FieldComponent, FieldData} from '@jaspero/form-builder';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Subscription} from 'rxjs';

enum Unit {
  px = 'px',
  em = 'em',
  rem = 'rem'
};

enum BorderStyle {
  solid = 'solid',
  dotted = 'dotted',
  dahsed = 'dashed'
};

enum Type {
  margin = 'margin',
  border = 'border',
  padding = 'padding'
}

enum Side {
  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left'
}

interface Sides<T = {size: number, unit: Unit.px}> {
  top?: T;
  right?: T;
  bottom?: T;
  left?: T;
}

interface BorderSide {
  size: number;
  unit: Unit.px;
  style: BorderStyle;
  radius: string;
  color: string;
}

interface Preset<T = string> {
  name: string;
  sides: Sides<T>;
}

interface Presets {
  border?: Preset<BorderSide>[];
  margin?: Preset[];
  padding?: Preset[];
}

export interface MbpData extends FieldData {
  units?: Unit[];
  presets?: Presets;
  margin?: {
    enabled?: boolean;
    defaultUnit?: string;
    defaultSize?: number;
  };
  border?: {
    enabled?: boolean;
    defaultUnit?: string;
    defaultSize?: number;
    defaultStyle?: BorderStyle;
    defaultRadiusLeft?: number;
    defaultRadiusRight?: number;
    defaultColor?: string
  };
  padding?: {
    enabled?: boolean;
    defaultUnit?: string;
    defaultSize?: number;
  };
  defaultUnit?: string;
}

interface Item {
  type: string;
  template: TemplateRef<any>;
  color: string;
  child?: Item;
}

@UntilDestroy()
@Component({
  selector: 'fb-pb-mbp',
  templateUrl: './mbp.component.html',
  styleUrls: ['./mbp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MbpComponent extends FieldComponent<MbpData> implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: MbpData,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    super(cData);
  }

  @ViewChild('sidesTemp', {static: true}) sidesTemplate: TemplateRef<any>

  Side = Side;
  Type = Type;
  BorderStyle = BorderStyle;

  form: FormGroup;
  selected: {type: Type; side: Side;};
  units: Unit[];
  item: Item;
  defaults: {
    margin?: {
      unit: string;
      size: number;
    };
    border?: {
      unit: string;
      size: number;
      style?: BorderStyle;
      radiusLeft?: number;
      radiusRight?: number;
      color?: string
    };
    padding?: {
      unit: string;
      size: number;
    };
  } = {};
  presets: Presets;

  private subscription: Subscription;

  get locked() {
    return this.form.get('locked').value as boolean;
  }

  ngOnInit() {
    this.item = [
      {type: Type.margin, template: this.sidesTemplate, color: '#f59e42'},
      {type: Type.border, template: this.sidesTemplate, color: '#ffc382'},
      {type: Type.padding, template: this.sidesTemplate, color: '#82ffb0'}
    ]
      .filter(({type}) => !this.cData[type] || this.cData[type].enabled)
      .reverse()
      .reduce((acc, cur) => ({
        ...cur,
        child: acc
      }), null);

    Object.values(Type).forEach(type => {
      if (!this.cData[type] || this.cData[type].enabled) {
        this.defaults[type] = {
          unit: this.cData[type]?.defaultUnit || this.cData.defaultUnit || 'px',
          size: this.cData[type]?.defaultSize || 0
        }
      }
    });

    if (this.defaults.border) {
      this.defaults.border.radiusLeft = this.cData?.border?.defaultRadiusLeft || 0;
      this.defaults.border.radiusRight = this.cData?.border?.defaultRadiusRight || 0;
      this.defaults.border.style = this.cData?.border?.defaultStyle || BorderStyle.solid;
      this.defaults.border.color = this.cData?.border?.defaultColor || '#000000';
    }

    this.units = this.cData.units || [Unit.px, Unit.em, Unit.rem];
    this.presets = this.cData.presets || {};
  }

  getSize(type: Type, side: Side) {
    const s = this.cData.control.value[type]?.[side] || {};
    const v = s.size;

    if (v) {
      return v + s.unit;
    }

    return '-';
  }

  selectSide(type: Type, side: Side) {

    this.selected = {type, side};

    const currentValue =
      this.cData.control.value[type]?.[side] ||
      this.defaults[type];

    let group: any = {
      preset: currentValue.preset || null,
      locked: currentValue.locked !== undefined ? currentValue.locked : true,
      size: currentValue.size || 0,
      unit: currentValue.unit
    };

    if (type === Type.border) {
      group.style = currentValue.style;
      group.radiusLeft = currentValue.radiusLeft;
      group.radiusRight = currentValue.radiusRight;
      group.color = currentValue.color
    }

    this.form = this.fb.group(group);

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.form.valueChanges
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(value => {
        for (const key in value) {
          if (value[key] === null) {
            delete value[key];
          }
        }

        const current = this.cData.control.value || {};

        if (!current[type]) {
          current[type] = {};
        }

        if (value.locked) {
          Object.values(Side).forEach(s =>
            current[type][s] = value
          );
        } else {
          current[type][side] = value;
        }

        if (value.preset) {
          const selectedPreset = (this.presets[type] as any[]).find(it => it.name === value.preset);

          if (
            selectedPreset.sides[side].size !== value.size ||
            selectedPreset.sides[side].unit !== value.unit
          ) {
            current[type][side].preset = null;
            this.form.get('preset').setValue(null, {onlySelf: true, emitEvent: false});
          }
        }

        this.cData.control.setValue(current);
      });

    this.cdr.markForCheck();
  }

  selectPreset(preset: Preset<any>) {
    const current = this.cData.control.value || {};

    if (!current[this.selected.type]) {
      current[this.selected.type] = {};
    }

    if (this.locked) {
      for (let key in preset.sides) {
        current[this.selected.type][key] = {...preset.sides[key], preset: preset.name};
      }
    } else {
      current[this.selected.type][this.selected.side] = preset.sides[this.selected.side];
      current[this.selected.type][this.selected.side].preset = preset.name;
    }

    this.form.patchValue(
      {...preset.sides[this.selected.side], preset: preset.name},
      {emitEvent: false}
    );
    this.cData.control.setValue(current);
  }

  clear() {
    const current = this.form.getRawValue();


    for (const key in current) {
      if (key !== 'locked') {
        current[key] = null;
      }
    }

    current.unit = this.defaults[this.selected.type].unit;

    this.form.setValue(current);
  }
}
