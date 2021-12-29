import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numericCommas'
})
export class NumericCommasPipe implements PipeTransform {

  transform(value: number | string | undefined, ...args: unknown[]): unknown {
    if (value === undefined) return value;
    let str;
    if (typeof value === 'number') str = value.toFixed(2).toString();
    else str = value;
    let numToString = "$ " + str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    numToString = numToString.replace('.00', '')

    return numToString;
  }

}
