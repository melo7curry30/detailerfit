const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const pricing = require('../pricing-data.js');

const q = pricing.quoteIQ;
assert.equal(q(1).monthly, 29.99);
assert.equal(q(2).monthly, 54.99);
assert.equal(q(3).monthly, 79.99);
assert.equal(q(3).annualTotal, 899.99);
assert.equal(q(3).extraMonthly, 50);
assert.equal(q(5, {automation: true}).monthly, 224.99);
assert.equal(q(10, {booking: true}).monthly, 299.99);
assert.equal(q(11, {booking: true}).monthly, 324.99);
assert.equal(q(25, {routing: true}).monthly, 674.99);
assert.equal(q(110, {booking: true}).extra, 100);
assert.match(q(111, {booking: true}).plan, /^Max/);
assert.equal(q(121, {booking: true}), null);
assert.equal(pricing.detailPilot(1).cost, 29);
assert.equal(pricing.detailPilot(3).cost, 119);

// Exercise the real Finder scoring entry point with its DOM setup stubbed.
// This checks plan integration and budget behavior, not browser rendering.
const ready = [];
const form = {dataset: {}, addEventListener() {}};
const context = {
  window: {DetailerFitPricing: pricing},
  document: {
    getElementById(id) {return id === 'finderForm' ? form : {};},
    querySelectorAll() {return [];},
    querySelector() {return null;},
    addEventListener(name, fn) {if (name === 'DOMContentLoaded') ready.push(fn);}
  }
};
vm.runInNewContext(fs.readFileSync('match-score.js', 'utf8'), context);
ready.forEach(fn => fn());
const score = context.window.DetailerFitMatchScore.scoreVendor;
const input = {team: 1, jobs: 25, budget: 20, booking: 'unsure', device: 'either', needs: [], setup: 'unsure', migration: 'unsure'};
const dp = score('DetailPilot', input);
assert.equal(dp.plan.cost, 29);
assert.equal(dp.inBudget, false, 'A paid subscription must not pass a $20 budget as a free plan');
assert.equal(score('DetailPilot', {...input, budget: 50}).inBudget, true);
const quote = score('QuoteIQ', {...input, team: 3, budget: 100});
assert.equal(quote.plan.cost, 79.99);
assert.equal(quote.inBudget, true);
assert.equal(score('QuoteIQ', {...input, team: 3, booking: 'yes'}).plan.cost, 299.99);
assert.equal(score('QuoteIQ', {...input, team: 5, needs: ['automation']}).plan.cost, 224.99);
assert.equal(score('ServiceM8', {...input, budget: 50}).plan.cost, 0);
assert.equal(score('Urable', {...input, booking: 'yes'}).plan.cost, 110);
assert.equal(score('Jobber', input).plan.cost, 49);
assert.equal(score('Housecall Pro', input).plan.cost, 79);
console.log('PASS: plan prices, feature gates, extra-user boundaries, annual billing, Finder budget gates and unaffected vendor paths.');
