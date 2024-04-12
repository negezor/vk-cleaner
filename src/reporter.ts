import yurnalist from 'yurnalist';

// @ts-expect-error CJS mixed
export const reporter = yurnalist.createReporter({});
