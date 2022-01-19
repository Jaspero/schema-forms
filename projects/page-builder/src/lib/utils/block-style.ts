export interface BackgroundData {
  background?: string;
  backgroundSize?: string;
  backgroundRepeat?: boolean;
  backgroundPosition?: string;
}

export interface BoxSides<T = {
  unit: string;
  size: number;
}> {
  top: T;
  right: T;
  bottom: T;
  left: T;
}

export interface BoxData {
  margin?: BoxSides;
  border?: BoxSides<{
    unit: string;
    size: number;
    radiusLeft: number;
    radiusRight: number;
    style: string;
    color: string;
  }>;
  padding?: BoxSides
}

export function backgroundStyle(data: BackgroundData) {
  const styles: {[key: string]: string} = {};

  if (data.background) {
    if (data.background.startsWith('http')) {

      if (data.backgroundSize) {
        styles['background-size'] = data.backgroundSize;
      }

      if (data.backgroundPosition) {
        styles['background-position'] = data.backgroundPosition;
      }

      if (!data.backgroundRepeat) {
        styles['background-repeat'] = 'no-repeat';
      }

      styles['background-image'] = `url("${data.background}")`;
    } else {
      styles.background = data.background;
    }
  }

  return styles;
}

export function boxStyle(data: BoxData = {}) {
  const styles: {[key: string]: string} = {};
  const borderStyles: {[key: string]: string} = {};
  const sides = [
    'top',
    'right',
    'bottom',
    'left'
  ];

  [
    'margin',
    'padding'
  ]
    .forEach(key => {
      if (!data[key]) {
        return;
      }

      const [top, right, bottom, left] = sides.map(side => {
        if (!data[key][side]) {
          return '0px';
        }

        const {size, unit} = data[key][side];

        return [size || 0, unit || 'px'].join('');
      });

      let final = '';

      if (top === right && top === bottom && top === left) {
        final = top;
      } else if (top === bottom && right === left) {
        final = [top, right].join(' ');
      } else {
        final = [top, right, bottom, left].join(' ');
      }

      styles[key] = final;
    });

  if (data.border) {
    const [top, right, bottom, left] = sides
      .map(side => {
        if (!data.border[side] || !data.border[side].size) {
          return '';
        }

        const {size, unit, style, color} = data.border[side];

        return [
          [size || 0, unit || 'px'].join(''),
          style || 'solid',
          color || 'black'
        ]
          .join(' ');
      });

    if (top === right && top === bottom && top === left) {
      if (top) {
        borderStyles.border = top;
      }
    } else {
      if (top) {
        borderStyles['border-top'] = top;
      }

      if (right) {
        borderStyles['border-right'] = right;
      }

      if (bottom) {
        borderStyles['border-bottom'] = bottom;
      }

      if (left) {
        borderStyles['border-left'] = left;
      }
    }

    const [topRightRadius, topLeftRadius, bottomRightRadius, bottomLeftRadius] = ['top', 'bottom']
      .reduce((acc: string[], side) => {

        ['Right', 'Left'].forEach(s => {
          if (!data.border[side] || !data.border[side]['radius' + s]) {
            acc.push('');
            return;
          }

          acc.push(
            [data.border[side]['radius' + s], data.border[side].unit || 'px']
              .join('')
          )
        });

        return acc;
      }, []);

    if (topRightRadius === topLeftRadius && topRightRadius === bottomRightRadius && topRightRadius === bottomLeftRadius) {
      if (topRightRadius) {
        borderStyles['border-radius'] = topRightRadius;
      }
    } else {
      if (topRightRadius) {
        borderStyles['border-top-right-radius'] = topRightRadius;
      }

      if (topLeftRadius) {
        borderStyles['border-top-left-radius'] = topLeftRadius;
      }

      if (bottomRightRadius) {
        borderStyles['border-bottom-right-radius'] = bottomRightRadius;
      }

      if (bottomLeftRadius) {
        borderStyles['border-bottom-left-radius'] = bottomLeftRadius;
      }
    }
  }

  return {
    ...styles,
    ...borderStyles
  };
}

export function blockStyle(
  data: {
    box?: BoxData;
  } & BackgroundData
) {
  const styles: {[key: string]: string} = {
    ...backgroundStyle(data),
    ...boxStyle(data.box)
  };

  let final = '';

  // tslint:disable-next-line:forin
  for (const key in styles) {
    final += `${key}:${styles[key]};`;
  }

  return final;
}
