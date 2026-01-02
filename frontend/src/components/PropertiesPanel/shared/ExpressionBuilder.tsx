import { useState, useMemo } from 'react';
import { Search, Plus, X, Code, Type, Hash, Calendar, Layers, Braces, FileJson, Columns } from 'lucide-react';

// Function definition type
interface FunctionDef {
  name: string;
  description: string;
  syntax: string;
  example: string;
  args: { name: string; type: string; optional?: boolean }[];
  returnType: string;
}

// Function categories
type FunctionCategory = 'string' | 'null' | 'conditional' | 'type' | 'math' | 'date' | 'array' | 'map' | 'json' | 'aggregate' | 'window';

// All available functions organized by category
const functionLibrary: Record<FunctionCategory, FunctionDef[]> = {
  string: [
    { name: 'concat', description: 'Concatenate strings', syntax: 'concat(col1, col2, ...)', example: 'concat(first_name, " ", last_name)', args: [{ name: 'cols', type: 'columns...' }], returnType: 'string' },
    { name: 'concat_ws', description: 'Concatenate with separator', syntax: 'concat_ws(sep, col1, col2, ...)', example: 'concat_ws("-", year, month, day)', args: [{ name: 'separator', type: 'string' }, { name: 'cols', type: 'columns...' }], returnType: 'string' },
    { name: 'substring', description: 'Extract substring', syntax: 'substring(col, start, len)', example: 'substring(phone, 1, 3)', args: [{ name: 'col', type: 'column' }, { name: 'start', type: 'int' }, { name: 'length', type: 'int' }], returnType: 'string' },
    { name: 'length', description: 'String length', syntax: 'length(col)', example: 'length(name)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'lower', description: 'Convert to lowercase', syntax: 'lower(col)', example: 'lower(email)', args: [{ name: 'col', type: 'column' }], returnType: 'string' },
    { name: 'upper', description: 'Convert to uppercase', syntax: 'upper(col)', example: 'upper(code)', args: [{ name: 'col', type: 'column' }], returnType: 'string' },
    { name: 'initcap', description: 'Capitalize first letter', syntax: 'initcap(col)', example: 'initcap(name)', args: [{ name: 'col', type: 'column' }], returnType: 'string' },
    { name: 'trim', description: 'Remove whitespace', syntax: 'trim(col)', example: 'trim(input)', args: [{ name: 'col', type: 'column' }], returnType: 'string' },
    { name: 'ltrim', description: 'Remove left whitespace', syntax: 'ltrim(col)', example: 'ltrim(input)', args: [{ name: 'col', type: 'column' }], returnType: 'string' },
    { name: 'rtrim', description: 'Remove right whitespace', syntax: 'rtrim(col)', example: 'rtrim(input)', args: [{ name: 'col', type: 'column' }], returnType: 'string' },
    { name: 'lpad', description: 'Left pad string', syntax: 'lpad(col, len, pad)', example: 'lpad(id, 5, "0")', args: [{ name: 'col', type: 'column' }, { name: 'length', type: 'int' }, { name: 'pad', type: 'string' }], returnType: 'string' },
    { name: 'rpad', description: 'Right pad string', syntax: 'rpad(col, len, pad)', example: 'rpad(code, 10, " ")', args: [{ name: 'col', type: 'column' }, { name: 'length', type: 'int' }, { name: 'pad', type: 'string' }], returnType: 'string' },
    { name: 'split', description: 'Split string into array', syntax: 'split(col, pattern)', example: 'split(tags, ",")', args: [{ name: 'col', type: 'column' }, { name: 'pattern', type: 'string' }], returnType: 'array' },
    { name: 'regexp_replace', description: 'Regex replace', syntax: 'regexp_replace(col, pattern, replacement)', example: 'regexp_replace(phone, "[^0-9]", "")', args: [{ name: 'col', type: 'column' }, { name: 'pattern', type: 'string' }, { name: 'replacement', type: 'string' }], returnType: 'string' },
    { name: 'regexp_extract', description: 'Regex extract', syntax: 'regexp_extract(col, pattern, group)', example: 'regexp_extract(email, "(.*)@", 1)', args: [{ name: 'col', type: 'column' }, { name: 'pattern', type: 'string' }, { name: 'group', type: 'int' }], returnType: 'string' },
    { name: 'translate', description: 'Character translation', syntax: 'translate(col, from, to)', example: 'translate(text, "abc", "xyz")', args: [{ name: 'col', type: 'column' }, { name: 'from', type: 'string' }, { name: 'to', type: 'string' }], returnType: 'string' },
    { name: 'reverse', description: 'Reverse string', syntax: 'reverse(col)', example: 'reverse(code)', args: [{ name: 'col', type: 'column' }], returnType: 'string' },
    { name: 'repeat', description: 'Repeat string', syntax: 'repeat(col, n)', example: 'repeat("-", 10)', args: [{ name: 'col', type: 'column' }, { name: 'n', type: 'int' }], returnType: 'string' },
    { name: 'locate', description: 'Find substring position', syntax: 'locate(substr, col)', example: 'locate("@", email)', args: [{ name: 'substr', type: 'string' }, { name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'instr', description: 'Find string position', syntax: 'instr(col, substr)', example: 'instr(text, "error")', args: [{ name: 'col', type: 'column' }, { name: 'substr', type: 'string' }], returnType: 'int' },
  ],
  null: [
    { name: 'coalesce', description: 'Return first non-null value', syntax: 'coalesce(col1, col2, ...)', example: 'coalesce(preferred_name, first_name)', args: [{ name: 'cols', type: 'columns...' }], returnType: 'any' },
    { name: 'ifnull', description: 'If null then default', syntax: 'ifnull(col, default)', example: 'ifnull(middle_name, "")', args: [{ name: 'col', type: 'column' }, { name: 'default', type: 'any' }], returnType: 'any' },
    { name: 'nullif', description: 'Return null if equal', syntax: 'nullif(col, value)', example: 'nullif(status, "unknown")', args: [{ name: 'col', type: 'column' }, { name: 'value', type: 'any' }], returnType: 'any' },
    { name: 'nvl', description: 'Null value replacement', syntax: 'nvl(col, default)', example: 'nvl(score, 0)', args: [{ name: 'col', type: 'column' }, { name: 'default', type: 'any' }], returnType: 'any' },
    { name: 'nvl2', description: 'Return based on null check', syntax: 'nvl2(col, if_not_null, if_null)', example: 'nvl2(email, "has_email", "no_email")', args: [{ name: 'col', type: 'column' }, { name: 'if_not_null', type: 'any' }, { name: 'if_null', type: 'any' }], returnType: 'any' },
    { name: 'nanvl', description: 'NaN value replacement', syntax: 'nanvl(col, default)', example: 'nanvl(ratio, 0.0)', args: [{ name: 'col', type: 'column' }, { name: 'default', type: 'number' }], returnType: 'number' },
    { name: 'isnan', description: 'Check if NaN', syntax: 'isnan(col)', example: 'isnan(value)', args: [{ name: 'col', type: 'column' }], returnType: 'boolean' },
    { name: 'isnull', description: 'Check if null', syntax: 'isnull(col)', example: 'isnull(email)', args: [{ name: 'col', type: 'column' }], returnType: 'boolean' },
    { name: 'isnotnull', description: 'Check if not null', syntax: 'isnotnull(col)', example: 'isnotnull(phone)', args: [{ name: 'col', type: 'column' }], returnType: 'boolean' },
  ],
  conditional: [
    { name: 'when', description: 'Conditional expression', syntax: 'when(condition, value).otherwise(default)', example: 'when(age >= 18, "adult").otherwise("minor")', args: [{ name: 'condition', type: 'boolean' }, { name: 'value', type: 'any' }], returnType: 'any' },
    { name: 'if', description: 'If-then-else', syntax: 'if(condition, true_val, false_val)', example: 'if(score > 50, "pass", "fail")', args: [{ name: 'condition', type: 'boolean' }, { name: 'true_val', type: 'any' }, { name: 'false_val', type: 'any' }], returnType: 'any' },
    { name: 'greatest', description: 'Return maximum value', syntax: 'greatest(col1, col2, ...)', example: 'greatest(price1, price2, price3)', args: [{ name: 'cols', type: 'columns...' }], returnType: 'any' },
    { name: 'least', description: 'Return minimum value', syntax: 'least(col1, col2, ...)', example: 'least(date1, date2)', args: [{ name: 'cols', type: 'columns...' }], returnType: 'any' },
    { name: 'case_when', description: 'Multiple conditions', syntax: 'CASE WHEN cond THEN val ... END', example: 'CASE WHEN status=1 THEN "active" WHEN status=0 THEN "inactive" ELSE "unknown" END', args: [], returnType: 'any' },
  ],
  type: [
    { name: 'cast', description: 'Cast to type', syntax: 'cast(col as type)', example: 'cast(amount as double)', args: [{ name: 'col', type: 'column' }, { name: 'type', type: 'datatype' }], returnType: 'any' },
    { name: 'to_date', description: 'Convert to date', syntax: 'to_date(col, format)', example: 'to_date(date_str, "yyyy-MM-dd")', args: [{ name: 'col', type: 'column' }, { name: 'format', type: 'string', optional: true }], returnType: 'date' },
    { name: 'to_timestamp', description: 'Convert to timestamp', syntax: 'to_timestamp(col, format)', example: 'to_timestamp(ts_str, "yyyy-MM-dd HH:mm:ss")', args: [{ name: 'col', type: 'column' }, { name: 'format', type: 'string', optional: true }], returnType: 'timestamp' },
    { name: 'to_json', description: 'Convert to JSON string', syntax: 'to_json(col)', example: 'to_json(struct_col)', args: [{ name: 'col', type: 'column' }], returnType: 'string' },
    { name: 'from_json', description: 'Parse JSON string', syntax: 'from_json(col, schema)', example: 'from_json(json_str, "struct<name:string,age:int>")', args: [{ name: 'col', type: 'column' }, { name: 'schema', type: 'string' }], returnType: 'struct' },
    { name: 'string', description: 'Cast to string', syntax: 'string(col)', example: 'string(id)', args: [{ name: 'col', type: 'column' }], returnType: 'string' },
    { name: 'int', description: 'Cast to integer', syntax: 'int(col)', example: 'int(str_num)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'double', description: 'Cast to double', syntax: 'double(col)', example: 'double(price)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'boolean', description: 'Cast to boolean', syntax: 'boolean(col)', example: 'boolean(flag)', args: [{ name: 'col', type: 'column' }], returnType: 'boolean' },
    { name: 'date', description: 'Cast to date', syntax: 'date(col)', example: 'date(timestamp_col)', args: [{ name: 'col', type: 'column' }], returnType: 'date' },
  ],
  math: [
    { name: 'abs', description: 'Absolute value', syntax: 'abs(col)', example: 'abs(difference)', args: [{ name: 'col', type: 'column' }], returnType: 'number' },
    { name: 'round', description: 'Round to decimals', syntax: 'round(col, scale)', example: 'round(price, 2)', args: [{ name: 'col', type: 'column' }, { name: 'scale', type: 'int', optional: true }], returnType: 'number' },
    { name: 'floor', description: 'Round down', syntax: 'floor(col)', example: 'floor(value)', args: [{ name: 'col', type: 'column' }], returnType: 'long' },
    { name: 'ceil', description: 'Round up', syntax: 'ceil(col)', example: 'ceil(value)', args: [{ name: 'col', type: 'column' }], returnType: 'long' },
    { name: 'pow', description: 'Power', syntax: 'pow(base, exp)', example: 'pow(value, 2)', args: [{ name: 'base', type: 'column' }, { name: 'exponent', type: 'number' }], returnType: 'double' },
    { name: 'sqrt', description: 'Square root', syntax: 'sqrt(col)', example: 'sqrt(variance)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'exp', description: 'Exponential', syntax: 'exp(col)', example: 'exp(rate)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'log', description: 'Natural logarithm', syntax: 'log(col)', example: 'log(value)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'log10', description: 'Base 10 logarithm', syntax: 'log10(col)', example: 'log10(value)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'mod', description: 'Modulus', syntax: 'mod(dividend, divisor)', example: 'mod(id, 10)', args: [{ name: 'dividend', type: 'column' }, { name: 'divisor', type: 'number' }], returnType: 'number' },
    { name: 'rand', description: 'Random number 0-1', syntax: 'rand(seed)', example: 'rand()', args: [{ name: 'seed', type: 'long', optional: true }], returnType: 'double' },
    { name: 'sign', description: 'Sign of number', syntax: 'sign(col)', example: 'sign(balance)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
  ],
  date: [
    { name: 'current_date', description: 'Current date', syntax: 'current_date()', example: 'current_date()', args: [], returnType: 'date' },
    { name: 'current_timestamp', description: 'Current timestamp', syntax: 'current_timestamp()', example: 'current_timestamp()', args: [], returnType: 'timestamp' },
    { name: 'year', description: 'Extract year', syntax: 'year(col)', example: 'year(birth_date)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'month', description: 'Extract month', syntax: 'month(col)', example: 'month(order_date)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'day', description: 'Extract day', syntax: 'day(col)', example: 'day(created_at)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'hour', description: 'Extract hour', syntax: 'hour(col)', example: 'hour(timestamp)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'minute', description: 'Extract minute', syntax: 'minute(col)', example: 'minute(timestamp)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'second', description: 'Extract second', syntax: 'second(col)', example: 'second(timestamp)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'dayofweek', description: 'Day of week (1=Sun)', syntax: 'dayofweek(col)', example: 'dayofweek(order_date)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'dayofyear', description: 'Day of year', syntax: 'dayofyear(col)', example: 'dayofyear(date)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'weekofyear', description: 'Week of year', syntax: 'weekofyear(col)', example: 'weekofyear(date)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'quarter', description: 'Quarter (1-4)', syntax: 'quarter(col)', example: 'quarter(sale_date)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'date_add', description: 'Add days', syntax: 'date_add(col, days)', example: 'date_add(start_date, 30)', args: [{ name: 'col', type: 'column' }, { name: 'days', type: 'int' }], returnType: 'date' },
    { name: 'date_sub', description: 'Subtract days', syntax: 'date_sub(col, days)', example: 'date_sub(end_date, 7)', args: [{ name: 'col', type: 'column' }, { name: 'days', type: 'int' }], returnType: 'date' },
    { name: 'add_months', description: 'Add months', syntax: 'add_months(col, months)', example: 'add_months(start_date, 3)', args: [{ name: 'col', type: 'column' }, { name: 'months', type: 'int' }], returnType: 'date' },
    { name: 'datediff', description: 'Difference in days', syntax: 'datediff(end, start)', example: 'datediff(end_date, start_date)', args: [{ name: 'end', type: 'column' }, { name: 'start', type: 'column' }], returnType: 'int' },
    { name: 'months_between', description: 'Difference in months', syntax: 'months_between(end, start)', example: 'months_between(end_date, start_date)', args: [{ name: 'end', type: 'column' }, { name: 'start', type: 'column' }], returnType: 'double' },
    { name: 'date_format', description: 'Format date', syntax: 'date_format(col, format)', example: 'date_format(date, "yyyy-MM")', args: [{ name: 'col', type: 'column' }, { name: 'format', type: 'string' }], returnType: 'string' },
    { name: 'date_trunc', description: 'Truncate date', syntax: 'date_trunc(unit, col)', example: 'date_trunc("month", date)', args: [{ name: 'unit', type: 'string' }, { name: 'col', type: 'column' }], returnType: 'timestamp' },
    { name: 'last_day', description: 'Last day of month', syntax: 'last_day(col)', example: 'last_day(date)', args: [{ name: 'col', type: 'column' }], returnType: 'date' },
    { name: 'next_day', description: 'Next weekday', syntax: 'next_day(col, dayOfWeek)', example: 'next_day(date, "Monday")', args: [{ name: 'col', type: 'column' }, { name: 'dayOfWeek', type: 'string' }], returnType: 'date' },
    { name: 'unix_timestamp', description: 'Convert to Unix timestamp', syntax: 'unix_timestamp(col, format)', example: 'unix_timestamp(date_str, "yyyy-MM-dd")', args: [{ name: 'col', type: 'column' }, { name: 'format', type: 'string', optional: true }], returnType: 'long' },
    { name: 'from_unixtime', description: 'Convert from Unix timestamp', syntax: 'from_unixtime(unix_time, format)', example: 'from_unixtime(ts, "yyyy-MM-dd HH:mm:ss")', args: [{ name: 'unix_time', type: 'column' }, { name: 'format', type: 'string', optional: true }], returnType: 'string' },
    { name: 'from_utc_timestamp', description: 'Convert from UTC to timezone', syntax: 'from_utc_timestamp(col, timezone)', example: 'from_utc_timestamp(utc_ts, "America/New_York")', args: [{ name: 'col', type: 'column' }, { name: 'timezone', type: 'string' }], returnType: 'timestamp' },
    { name: 'to_utc_timestamp', description: 'Convert to UTC from timezone', syntax: 'to_utc_timestamp(col, timezone)', example: 'to_utc_timestamp(local_ts, "America/New_York")', args: [{ name: 'col', type: 'column' }, { name: 'timezone', type: 'string' }], returnType: 'timestamp' },
    { name: 'make_date', description: 'Create date from parts', syntax: 'make_date(year, month, day)', example: 'make_date(2024, 1, 15)', args: [{ name: 'year', type: 'int' }, { name: 'month', type: 'int' }, { name: 'day', type: 'int' }], returnType: 'date' },
    { name: 'make_timestamp', description: 'Create timestamp from parts', syntax: 'make_timestamp(year, month, day, hour, min, sec)', example: 'make_timestamp(2024, 1, 15, 10, 30, 0)', args: [{ name: 'year', type: 'int' }, { name: 'month', type: 'int' }, { name: 'day', type: 'int' }, { name: 'hour', type: 'int' }, { name: 'min', type: 'int' }, { name: 'sec', type: 'int' }], returnType: 'timestamp' },
  ],
  array: [
    { name: 'array', description: 'Create array', syntax: 'array(val1, val2, ...)', example: 'array(col1, col2, col3)', args: [{ name: 'values', type: 'any...' }], returnType: 'array' },
    { name: 'array_contains', description: 'Check if contains', syntax: 'array_contains(arr, val)', example: 'array_contains(tags, "sale")', args: [{ name: 'arr', type: 'column' }, { name: 'value', type: 'any' }], returnType: 'boolean' },
    { name: 'array_distinct', description: 'Remove duplicates', syntax: 'array_distinct(arr)', example: 'array_distinct(items)', args: [{ name: 'arr', type: 'column' }], returnType: 'array' },
    { name: 'array_join', description: 'Join to string', syntax: 'array_join(arr, delimiter)', example: 'array_join(tags, ",")', args: [{ name: 'arr', type: 'column' }, { name: 'delimiter', type: 'string' }], returnType: 'string' },
    { name: 'array_max', description: 'Maximum element', syntax: 'array_max(arr)', example: 'array_max(scores)', args: [{ name: 'arr', type: 'column' }], returnType: 'any' },
    { name: 'array_min', description: 'Minimum element', syntax: 'array_min(arr)', example: 'array_min(scores)', args: [{ name: 'arr', type: 'column' }], returnType: 'any' },
    { name: 'array_position', description: 'Find element position', syntax: 'array_position(arr, val)', example: 'array_position(items, "apple")', args: [{ name: 'arr', type: 'column' }, { name: 'value', type: 'any' }], returnType: 'long' },
    { name: 'array_remove', description: 'Remove element', syntax: 'array_remove(arr, val)', example: 'array_remove(items, null)', args: [{ name: 'arr', type: 'column' }, { name: 'value', type: 'any' }], returnType: 'array' },
    { name: 'array_sort', description: 'Sort array', syntax: 'array_sort(arr)', example: 'array_sort(values)', args: [{ name: 'arr', type: 'column' }], returnType: 'array' },
    { name: 'array_union', description: 'Union of arrays', syntax: 'array_union(arr1, arr2)', example: 'array_union(tags1, tags2)', args: [{ name: 'arr1', type: 'column' }, { name: 'arr2', type: 'column' }], returnType: 'array' },
    { name: 'array_intersect', description: 'Intersection', syntax: 'array_intersect(arr1, arr2)', example: 'array_intersect(set1, set2)', args: [{ name: 'arr1', type: 'column' }, { name: 'arr2', type: 'column' }], returnType: 'array' },
    { name: 'array_except', description: 'Difference', syntax: 'array_except(arr1, arr2)', example: 'array_except(all_items, sold_items)', args: [{ name: 'arr1', type: 'column' }, { name: 'arr2', type: 'column' }], returnType: 'array' },
    { name: 'size', description: 'Array/Map size', syntax: 'size(col)', example: 'size(items)', args: [{ name: 'col', type: 'column' }], returnType: 'int' },
    { name: 'element_at', description: 'Get element at index', syntax: 'element_at(arr, index)', example: 'element_at(items, 1)', args: [{ name: 'arr', type: 'column' }, { name: 'index', type: 'int' }], returnType: 'any' },
    { name: 'flatten', description: 'Flatten nested array', syntax: 'flatten(arr)', example: 'flatten(nested_arr)', args: [{ name: 'arr', type: 'column' }], returnType: 'array' },
    { name: 'slice', description: 'Slice array', syntax: 'slice(arr, start, len)', example: 'slice(items, 1, 5)', args: [{ name: 'arr', type: 'column' }, { name: 'start', type: 'int' }, { name: 'length', type: 'int' }], returnType: 'array' },
    { name: 'arrays_zip', description: 'Zip multiple arrays', syntax: 'arrays_zip(arr1, arr2, ...)', example: 'arrays_zip(names, ages)', args: [{ name: 'arrays', type: 'columns...' }], returnType: 'array' },
    { name: 'array_repeat', description: 'Repeat element N times', syntax: 'array_repeat(element, count)', example: 'array_repeat("x", 5)', args: [{ name: 'element', type: 'any' }, { name: 'count', type: 'int' }], returnType: 'array' },
    { name: 'sequence', description: 'Generate sequence array', syntax: 'sequence(start, stop, step)', example: 'sequence(1, 10, 2)', args: [{ name: 'start', type: 'any' }, { name: 'stop', type: 'any' }, { name: 'step', type: 'any', optional: true }], returnType: 'array' },
    { name: 'array_compact', description: 'Remove nulls from array', syntax: 'array_compact(arr)', example: 'array_compact(items)', args: [{ name: 'arr', type: 'column' }], returnType: 'array' },
    { name: 'array_prepend', description: 'Prepend element to array', syntax: 'array_prepend(arr, element)', example: 'array_prepend(items, "first")', args: [{ name: 'arr', type: 'column' }, { name: 'element', type: 'any' }], returnType: 'array' },
    { name: 'array_append', description: 'Append element to array', syntax: 'array_append(arr, element)', example: 'array_append(items, "last")', args: [{ name: 'arr', type: 'column' }, { name: 'element', type: 'any' }], returnType: 'array' },
    { name: 'reverse', description: 'Reverse array', syntax: 'reverse(arr)', example: 'reverse(items)', args: [{ name: 'arr', type: 'column' }], returnType: 'array' },
    { name: 'shuffle', description: 'Randomly shuffle array', syntax: 'shuffle(arr)', example: 'shuffle(items)', args: [{ name: 'arr', type: 'column' }], returnType: 'array' },
  ],
  map: [
    { name: 'map', description: 'Create map', syntax: 'map(k1, v1, k2, v2, ...)', example: 'map("name", name, "age", age)', args: [{ name: 'key_value_pairs', type: 'any...' }], returnType: 'map' },
    { name: 'map_from_arrays', description: 'Map from key/value arrays', syntax: 'map_from_arrays(keys, values)', example: 'map_from_arrays(key_arr, val_arr)', args: [{ name: 'keys', type: 'column' }, { name: 'values', type: 'column' }], returnType: 'map' },
    { name: 'map_keys', description: 'Get map keys', syntax: 'map_keys(map)', example: 'map_keys(properties)', args: [{ name: 'map', type: 'column' }], returnType: 'array' },
    { name: 'map_values', description: 'Get map values', syntax: 'map_values(map)', example: 'map_values(properties)', args: [{ name: 'map', type: 'column' }], returnType: 'array' },
    { name: 'map_entries', description: 'Get map entries', syntax: 'map_entries(map)', example: 'map_entries(properties)', args: [{ name: 'map', type: 'column' }], returnType: 'array' },
    { name: 'map_concat', description: 'Concatenate maps', syntax: 'map_concat(map1, map2)', example: 'map_concat(props1, props2)', args: [{ name: 'map1', type: 'column' }, { name: 'map2', type: 'column' }], returnType: 'map' },
  ],
  json: [
    { name: 'get_json_object', description: 'Extract from JSON', syntax: 'get_json_object(col, path)', example: 'get_json_object(json_col, "$.name")', args: [{ name: 'col', type: 'column' }, { name: 'path', type: 'string' }], returnType: 'string' },
    { name: 'json_tuple', description: 'Extract multiple from JSON', syntax: 'json_tuple(col, k1, k2, ...)', example: 'json_tuple(json_col, "name", "age")', args: [{ name: 'col', type: 'column' }, { name: 'keys', type: 'string...' }], returnType: 'tuple' },
    { name: 'schema_of_json', description: 'Infer JSON schema', syntax: 'schema_of_json(json_str)', example: 'schema_of_json(\'{"name":"test"}\')', args: [{ name: 'json', type: 'string' }], returnType: 'string' },
  ],
  aggregate: [
    { name: 'sum', description: 'Sum of values', syntax: 'sum(col)', example: 'sum(amount)', args: [{ name: 'col', type: 'column' }], returnType: 'number' },
    { name: 'avg', description: 'Average', syntax: 'avg(col)', example: 'avg(score)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'count', description: 'Count rows', syntax: 'count(col)', example: 'count(id)', args: [{ name: 'col', type: 'column' }], returnType: 'long' },
    { name: 'min', description: 'Minimum', syntax: 'min(col)', example: 'min(price)', args: [{ name: 'col', type: 'column' }], returnType: 'any' },
    { name: 'max', description: 'Maximum', syntax: 'max(col)', example: 'max(price)', args: [{ name: 'col', type: 'column' }], returnType: 'any' },
    { name: 'first', description: 'First value', syntax: 'first(col)', example: 'first(name)', args: [{ name: 'col', type: 'column' }], returnType: 'any' },
    { name: 'last', description: 'Last value', syntax: 'last(col)', example: 'last(status)', args: [{ name: 'col', type: 'column' }], returnType: 'any' },
    { name: 'collect_list', description: 'Collect to list', syntax: 'collect_list(col)', example: 'collect_list(item)', args: [{ name: 'col', type: 'column' }], returnType: 'array' },
    { name: 'collect_set', description: 'Collect to set', syntax: 'collect_set(col)', example: 'collect_set(category)', args: [{ name: 'col', type: 'column' }], returnType: 'array' },
    { name: 'approx_count_distinct', description: 'Approx distinct count', syntax: 'approx_count_distinct(col)', example: 'approx_count_distinct(user_id)', args: [{ name: 'col', type: 'column' }], returnType: 'long' },
    { name: 'stddev', description: 'Standard deviation (sample)', syntax: 'stddev(col)', example: 'stddev(score)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'stddev_pop', description: 'Population standard deviation', syntax: 'stddev_pop(col)', example: 'stddev_pop(score)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'stddev_samp', description: 'Sample standard deviation', syntax: 'stddev_samp(col)', example: 'stddev_samp(score)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'variance', description: 'Variance (sample)', syntax: 'variance(col)', example: 'variance(price)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'var_pop', description: 'Population variance', syntax: 'var_pop(col)', example: 'var_pop(price)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'var_samp', description: 'Sample variance', syntax: 'var_samp(col)', example: 'var_samp(price)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'percentile_approx', description: 'Approximate percentile', syntax: 'percentile_approx(col, percentage, accuracy)', example: 'percentile_approx(salary, 0.5, 100)', args: [{ name: 'col', type: 'column' }, { name: 'percentage', type: 'double' }, { name: 'accuracy', type: 'int', optional: true }], returnType: 'double' },
    { name: 'corr', description: 'Pearson correlation', syntax: 'corr(col1, col2)', example: 'corr(height, weight)', args: [{ name: 'col1', type: 'column' }, { name: 'col2', type: 'column' }], returnType: 'double' },
    { name: 'covar_pop', description: 'Population covariance', syntax: 'covar_pop(col1, col2)', example: 'covar_pop(x, y)', args: [{ name: 'col1', type: 'column' }, { name: 'col2', type: 'column' }], returnType: 'double' },
    { name: 'covar_samp', description: 'Sample covariance', syntax: 'covar_samp(col1, col2)', example: 'covar_samp(x, y)', args: [{ name: 'col1', type: 'column' }, { name: 'col2', type: 'column' }], returnType: 'double' },
    { name: 'kurtosis', description: 'Kurtosis of values', syntax: 'kurtosis(col)', example: 'kurtosis(values)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'skewness', description: 'Skewness of values', syntax: 'skewness(col)', example: 'skewness(values)', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'count_distinct', description: 'Count distinct values', syntax: 'count_distinct(col)', example: 'count_distinct(category)', args: [{ name: 'col', type: 'column' }], returnType: 'long' },
    { name: 'sumDistinct', description: 'Sum of distinct values', syntax: 'sumDistinct(col)', example: 'sumDistinct(amount)', args: [{ name: 'col', type: 'column' }], returnType: 'number' },
  ],
  window: [
    { name: 'row_number', description: 'Sequential row number', syntax: 'row_number().over(Window.partitionBy(col).orderBy(col))', example: 'row_number().over(Window.partitionBy("dept").orderBy("salary"))', args: [], returnType: 'long' },
    { name: 'rank', description: 'Rank with gaps', syntax: 'rank().over(Window.partitionBy(col).orderBy(col))', example: 'rank().over(Window.partitionBy("dept").orderBy(col("salary").desc()))', args: [], returnType: 'int' },
    { name: 'dense_rank', description: 'Rank without gaps', syntax: 'dense_rank().over(Window.partitionBy(col).orderBy(col))', example: 'dense_rank().over(Window.partitionBy("category").orderBy("score"))', args: [], returnType: 'int' },
    { name: 'ntile', description: 'Divide into N buckets', syntax: 'ntile(n).over(Window.partitionBy(col).orderBy(col))', example: 'ntile(4).over(Window.orderBy("score"))', args: [{ name: 'n', type: 'int' }], returnType: 'int' },
    { name: 'percent_rank', description: 'Relative rank (0-1)', syntax: 'percent_rank().over(Window.orderBy(col))', example: 'percent_rank().over(Window.partitionBy("dept").orderBy("salary"))', args: [], returnType: 'double' },
    { name: 'cume_dist', description: 'Cumulative distribution', syntax: 'cume_dist().over(Window.orderBy(col))', example: 'cume_dist().over(Window.partitionBy("region").orderBy("sales"))', args: [], returnType: 'double' },
    { name: 'lag', description: 'Previous row value', syntax: 'lag(col, offset, default).over(Window.orderBy(col))', example: 'lag("price", 1, 0).over(Window.partitionBy("product").orderBy("date"))', args: [{ name: 'col', type: 'column' }, { name: 'offset', type: 'int', optional: true }, { name: 'default', type: 'any', optional: true }], returnType: 'any' },
    { name: 'lead', description: 'Next row value', syntax: 'lead(col, offset, default).over(Window.orderBy(col))', example: 'lead("price", 1).over(Window.partitionBy("product").orderBy("date"))', args: [{ name: 'col', type: 'column' }, { name: 'offset', type: 'int', optional: true }, { name: 'default', type: 'any', optional: true }], returnType: 'any' },
    { name: 'first_value', description: 'First value in window', syntax: 'first_value(col).over(Window.orderBy(col))', example: 'first_value("status").over(Window.partitionBy("order_id").orderBy("timestamp"))', args: [{ name: 'col', type: 'column' }], returnType: 'any' },
    { name: 'last_value', description: 'Last value in window', syntax: 'last_value(col).over(Window.orderBy(col))', example: 'last_value("price").over(Window.partitionBy("product").orderBy("date"))', args: [{ name: 'col', type: 'column' }], returnType: 'any' },
    { name: 'nth_value', description: 'Nth value in window', syntax: 'nth_value(col, n).over(Window.orderBy(col))', example: 'nth_value("score", 2).over(Window.partitionBy("student").orderBy("exam_date"))', args: [{ name: 'col', type: 'column' }, { name: 'n', type: 'int' }], returnType: 'any' },
    { name: 'sum (window)', description: 'Running/Window sum', syntax: 'sum(col).over(Window.partitionBy(col).orderBy(col))', example: 'sum("amount").over(Window.partitionBy("account").orderBy("date"))', args: [{ name: 'col', type: 'column' }], returnType: 'number' },
    { name: 'avg (window)', description: 'Moving/Window average', syntax: 'avg(col).over(Window.partitionBy(col).orderBy(col))', example: 'avg("price").over(Window.partitionBy("product").orderBy("date").rowsBetween(-2, 0))', args: [{ name: 'col', type: 'column' }], returnType: 'double' },
    { name: 'count (window)', description: 'Window count', syntax: 'count(col).over(Window.partitionBy(col))', example: 'count("*").over(Window.partitionBy("category"))', args: [{ name: 'col', type: 'column' }], returnType: 'long' },
    { name: 'min (window)', description: 'Window minimum', syntax: 'min(col).over(Window.partitionBy(col))', example: 'min("price").over(Window.partitionBy("product"))', args: [{ name: 'col', type: 'column' }], returnType: 'any' },
    { name: 'max (window)', description: 'Window maximum', syntax: 'max(col).over(Window.partitionBy(col))', example: 'max("score").over(Window.partitionBy("student"))', args: [{ name: 'col', type: 'column' }], returnType: 'any' },
  ],
};

const categoryInfo: Record<FunctionCategory, { label: string; icon: React.ReactNode; color: string }> = {
  string: { label: 'String', icon: <Type className="w-3 h-3" />, color: 'text-green-400' },
  null: { label: 'Null', icon: <X className="w-3 h-3" />, color: 'text-yellow-400' },
  conditional: { label: 'Condition', icon: <Hash className="w-3 h-3" />, color: 'text-purple-400' },
  type: { label: 'Cast', icon: <Hash className="w-3 h-3" />, color: 'text-blue-400' },
  math: { label: 'Math', icon: <Hash className="w-3 h-3" />, color: 'text-cyan-400' },
  date: { label: 'Date', icon: <Calendar className="w-3 h-3" />, color: 'text-orange-400' },
  array: { label: 'Array', icon: <Layers className="w-3 h-3" />, color: 'text-pink-400' },
  map: { label: 'Map', icon: <Braces className="w-3 h-3" />, color: 'text-indigo-400' },
  json: { label: 'JSON', icon: <FileJson className="w-3 h-3" />, color: 'text-teal-400' },
  aggregate: { label: 'Agg', icon: <Layers className="w-3 h-3" />, color: 'text-red-400' },
  window: { label: 'Window', icon: <Columns className="w-3 h-3" />, color: 'text-amber-400' },
};

interface ExpressionBuilderProps {
  value: string;
  onChange: (expression: string) => void;
  availableColumns: { name: string; dataType: string }[];
  placeholder?: string;
}

export const ExpressionBuilder = ({
  value,
  onChange,
  availableColumns,
  placeholder = 'Enter expression or select a function...'
}: ExpressionBuilderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FunctionCategory>('string');
  const [activeTab, setActiveTab] = useState<'functions' | 'columns'>('functions');
  const [selectedFunction, setSelectedFunction] = useState<FunctionDef | null>(null);

  // Filter functions based on search
  const filteredFunctions = useMemo(() => {
    if (!search) {
      return functionLibrary[activeCategory];
    }
    const searchLower = search.toLowerCase();
    const results: FunctionDef[] = [];
    Object.values(functionLibrary).forEach(funcs => {
      funcs.forEach(fn => {
        if (fn.name.toLowerCase().includes(searchLower) ||
            fn.description.toLowerCase().includes(searchLower)) {
          results.push(fn);
        }
      });
    });
    return results;
  }, [search, activeCategory]);

  const insertFunction = (fn: FunctionDef) => {
    const template = fn.syntax;
    onChange(value ? `${value} ${template}` : template);
    setSelectedFunction(fn);
  };

  const insertColumn = (colName: string) => {
    onChange(value ? `${value} ${colName}` : colName);
  };

  return (
    <div className="space-y-2">
      {/* Expression Input */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white
                     font-mono resize-none focus:outline-none focus:border-accent min-h-[60px]"
          rows={2}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute right-2 top-2 p-1.5 rounded transition-colors
                     ${isOpen ? 'bg-accent text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
          title="Open function builder"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Function Builder Panel */}
      {isOpen && (
        <div className="border border-gray-600 rounded-lg bg-panel overflow-hidden">
          {/* Tab Toggle: Functions vs Columns */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('functions')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium transition-colors
                         ${activeTab === 'functions' ? 'bg-accent/20 text-accent border-b-2 border-accent' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Code className="w-3 h-3" />
              Functions
            </button>
            <button
              onClick={() => setActiveTab('columns')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium transition-colors
                         ${activeTab === 'columns' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Columns className="w-3 h-3" />
              Columns ({availableColumns.length})
            </button>
          </div>

          {/* Functions Tab */}
          {activeTab === 'functions' && (
            <>
              {/* Search */}
              <div className="p-2 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search functions..."
                    className="w-full pl-8 pr-3 py-1.5 bg-canvas border border-gray-600 rounded text-sm text-white"
                  />
                </div>
              </div>

              {/* Main Content: Categories (Left) + Functions (Right) */}
              <div className="flex max-h-[250px]">
                {/* Category List (Left Side) */}
                <div className="w-24 border-r border-gray-700 overflow-y-auto flex-shrink-0">
                  {(Object.keys(categoryInfo) as FunctionCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setSearch('');
                      }}
                      className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-left text-[11px] transition-colors
                                 ${activeCategory === cat && !search ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                      <span className={activeCategory === cat && !search ? 'text-accent' : categoryInfo[cat].color}>
                        {categoryInfo[cat].icon}
                      </span>
                      <span className="truncate">{categoryInfo[cat].label}</span>
                    </button>
                  ))}
                </div>

                {/* Functions List (Right Side) */}
                <div className="flex-1 overflow-y-auto p-1">
                  {filteredFunctions.length > 0 ? (
                    <div className="space-y-0.5">
                      {filteredFunctions.map((fn) => (
                        <button
                          key={fn.name}
                          onClick={() => insertFunction(fn)}
                          onMouseEnter={() => setSelectedFunction(fn)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/20 text-left group"
                        >
                          <Plus className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-white">{fn.name}()</div>
                            <div className="text-[10px] text-gray-500 truncate">{fn.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 text-xs py-4">No functions found</div>
                  )}
                </div>
              </div>

              {/* Function Details */}
              {selectedFunction && (
                <div className="p-2 border-t border-gray-700 bg-canvas/50">
                  <div className="text-xs text-white font-medium mb-1">{selectedFunction.name}</div>
                  <div className="text-[10px] text-gray-400 mb-1">
                    <code className="text-accent">{selectedFunction.syntax}</code>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Example: <code className="text-green-400">{selectedFunction.example}</code>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Columns Tab */}
          {activeTab === 'columns' && (
            <div className="max-h-[280px] overflow-y-auto p-2">
              {availableColumns.length > 0 ? (
                <div className="space-y-1">
                  {availableColumns.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => insertColumn(col.name)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-500/20 text-left group"
                    >
                      <Plus className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100" />
                      <div className="flex-1">
                        <div className="text-sm text-white">{col.name}</div>
                        <div className="text-[10px] text-gray-500">{col.dataType}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-xs py-8">
                  No columns available.<br />
                  Connect a source node to see columns.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Function Buttons */}
      <div className="flex flex-wrap gap-1">
        <span className="text-[10px] text-gray-500 mr-1">Quick:</span>
        {['coalesce', 'concat', 'when', 'cast', 'round', 'upper', 'trim'].map((fn) => (
          <button
            key={fn}
            onClick={() => {
              const funcDef = Object.values(functionLibrary).flat().find(f => f.name === fn);
              if (funcDef) insertFunction(funcDef);
            }}
            className="px-1.5 py-0.5 text-[10px] bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            {fn}()
          </button>
        ))}
      </div>
    </div>
  );
};
