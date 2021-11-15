import { NumericCommasPipe } from './numeric-commas.pipe';

describe('NumericCommasPipe', () => {
  it('create an instance', () => {
    const pipe = new NumericCommasPipe();
    expect(pipe).toBeTruthy();
  });
});
