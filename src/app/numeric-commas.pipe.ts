import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numericCommas'
})
export class NumericCommasPipe implements PipeTransform {

  transform(value: number | string, ...args: unknown[]): unknown {
    let str;
    if (typeof value === 'number') str = value.toString();
    else str = value;
    let numToString = "$ " + str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return numToString;
  }

}
