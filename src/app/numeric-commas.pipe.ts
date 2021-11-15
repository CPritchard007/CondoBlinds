import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numericCommas'
})
export class NumericCommasPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): unknown {
    let numToString = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return numToString;
  }

}
