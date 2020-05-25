export const parseSize = (size: string | number): number => {
  if (typeof size === 'number') {
    return size;
  }

  const KB = 1024;
  const MB = KB ** 2;

  const num = parseFloat(size);
  const unit = size.replace(/[0-9]/g, '').toLowerCase();

  console.log(num, unit);
  switch (unit) {
    case 'kb': {
      return num * KB;
    }
    case 'mb': {
      return num * MB;
    }
    default: {
      return 0;
    }
  }
};
