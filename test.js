import test from 'ava';
import fn from './';
import {SourceMapConsumer} from 'source-map';
import convertSourceMap from 'convert-source-map';

test('creates sources for individual test files', t => {
	const result = fn(input);

	result.forEach(r => r.code = trim(r.code));

	t.is(result.length, 3);

	t.is(result[0].code, trim(test0));
	t.is(result[1].code, trim(test1));
	t.is(result[2].code, trim(test2));
});

test('it provides accurate source maps', t => {
	const result = fn(input, {filename: 'foo.js'});

	const consumer = new SourceMapConsumer(result[1].map);

	const loc = consumer.originalPositionFor({
		line: 7,
		column: 8
	});

	t.deepEqual(loc, {
		source: 'foo.js',
		line: 9,
		column: 8,
		name: null
	});
});

test('it will attach source map comments', t => {
	const result = fn(input, {
		filename: 'foo.js',
		attachComment: true
	});

	const map = convertSourceMap.fromSource(result[1].code);
	const consumer = new SourceMapConsumer(map.toObject());

	const loc = consumer.originalPositionFor({
		line: 7,
		column: 8
	});

	t.deepEqual(loc, {
		source: 'foo.js',
		line: 9,
		column: 8,
		name: null
	});
});

test('nested names', t => {
	const results = fn(input);

	t.deepEqual(results[0].nestedName, ['foo', 'foo-1']);
	t.deepEqual(results[1].nestedName, ['foo', 'foo-2']);
	t.deepEqual(results[2].nestedName, ['bar', 'bar-1']);
});

function trim(code) {
	return code.replace(/[\s\n\t]+/g, ' ');
}


const input =`
	var foo = 'bar';

	describe('foo', function () {
		function fooHelper() {}

		it('foo-1', function () {});

		it('foo-2', function () {});
	});

	describe('bar', function () {
		function barHelper() {}

		it('bar-1', function () {});
	});
`;

const test0 = `
	var foo = 'bar';

	describe('foo', function () {
		function fooHelper() {}

		it('foo-1', function () {});
	});
`;

const test1 = `
	var foo = 'bar';

	describe('foo', function () {
		function fooHelper() {}

		it('foo-2', function () {});
	});
`;

const test2 = `
	var foo = 'bar';

	describe('bar', function () {
		function barHelper() {}

		it('bar-1', function () {});
	});
`;
