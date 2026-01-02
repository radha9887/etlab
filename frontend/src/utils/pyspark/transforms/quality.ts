import { mapDataTypeToPySpark } from '../helpers';

// Generate code for data quality transforms (greatExpectations, sodaCore, dataAssertions, schemaValidation)
export const generateQualityTransformCode = (
  transformType: string,
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (transformType) {
    case 'greatExpectations': {
      const suiteName = config.suiteName as string || 'my_data_suite';
      const expectations = config.expectations as Array<{type: string; column?: string; params?: Record<string, unknown>}> || [];
      const failOnError = config.failOnError as boolean ?? false;

      lines.push(`# Great Expectations - Data Quality Validation`);
      lines.push(`# Note: Requires great_expectations package`);
      lines.push(`import great_expectations as gx`);
      lines.push(`from great_expectations.dataset import SparkDFDataset`);
      lines.push(``);
      lines.push(`# Convert to Great Expectations dataset`);
      lines.push(`ge_df = SparkDFDataset(${inputVarName})`);
      lines.push(``);
      lines.push(`# Define expectations for suite: ${suiteName}`);

      if (expectations.length > 0) {
        expectations.forEach(exp => {
          const params = exp.params ? Object.entries(exp.params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => typeof v === 'string' ? `${k}="${v}"` : `${k}=${v}`)
            .join(', ') : '';

          if (exp.column) {
            lines.push(`ge_df.expect_column_${exp.type}("${exp.column}"${params ? ', ' + params : ''})`);
          } else {
            lines.push(`ge_df.expect_${exp.type}(${params})`);
          }
        });
      } else {
        lines.push(`# Add your expectations here`);
        lines.push(`# ge_df.expect_column_values_to_not_be_null("column_name")`);
        lines.push(`# ge_df.expect_column_values_to_be_unique("column_name")`);
      }

      lines.push(``);
      lines.push(`# Validate data`);
      lines.push(`validation_result = ge_df.validate()`);
      lines.push(``);
      if (failOnError) {
        lines.push(`# Fail pipeline if validation fails`);
        lines.push(`if not validation_result["success"]:`);
        lines.push(`    raise ValueError(f"Great Expectations validation failed: {validation_result}")`);
        lines.push(``);
      }
      lines.push(`# Store validation result`);
      lines.push(`validation_success = validation_result["success"]`);
      lines.push(`print(f"GE Validation Result: {'PASSED' if validation_success else 'FAILED'}")`);
      lines.push(``);
      lines.push(`${varName} = ${inputVarName}  # Data validated with Great Expectations`);
      return true;
    }

    case 'sodaCore': {
      const scanName = config.scanName as string || 'my_soda_scan';
      const checks = config.checks as Array<{type: string; column?: string; threshold?: string; customSql?: string}> || [];
      const failOnError = config.failOnError as boolean ?? false;

      lines.push(`# Soda Core - Data Quality Checks`);
      lines.push(`# Note: Requires soda-core-spark package`);
      lines.push(`from soda.scan import Scan`);
      lines.push(``);
      lines.push(`# Create temporary view for Soda scan`);
      lines.push(`${inputVarName}.createOrReplaceTempView("${scanName}_data")`);
      lines.push(``);
      lines.push(`# Define Soda checks YAML`);
      lines.push(`soda_checks_yaml = """`);
      lines.push(`checks for ${scanName}_data:`);

      if (checks.length > 0) {
        checks.forEach(check => {
          if (check.type === 'row_count') {
            const threshold = check.threshold || '> 0';
            lines.push(`  - row_count ${threshold}`);
          } else if (check.type === 'missing_count' && check.column) {
            const threshold = check.threshold || '= 0';
            lines.push(`  - missing_count(${check.column}) ${threshold}`);
          } else if (check.type === 'duplicate_count' && check.column) {
            const threshold = check.threshold || '= 0';
            lines.push(`  - duplicate_count(${check.column}) ${threshold}`);
          } else if (check.type === 'invalid_count' && check.column) {
            const threshold = check.threshold || '= 0';
            lines.push(`  - invalid_count(${check.column}) ${threshold}`);
          } else if (check.type === 'freshness' && check.column) {
            const threshold = check.threshold || '< 1d';
            lines.push(`  - freshness(${check.column}) ${threshold}`);
          } else if (check.type === 'custom_sql' && check.customSql) {
            lines.push(`  - ${check.customSql}`);
          }
        });
      } else {
        lines.push(`  - row_count > 0`);
        lines.push(`  # - missing_count(column_name) = 0`);
        lines.push(`  # - duplicate_count(id) = 0`);
      }

      lines.push(`"""`);
      lines.push(``);
      lines.push(`# Execute Soda scan`);
      lines.push(`scan = Scan()`);
      lines.push(`scan.set_data_source_name("spark_df")`);
      lines.push(`scan.add_spark_session(spark)`);
      lines.push(`scan.add_sodacl_yaml_str(soda_checks_yaml)`);
      lines.push(`scan.execute()`);
      lines.push(``);
      lines.push(`# Get scan results`);
      lines.push(`scan_result = scan.get_scan_results()`);
      lines.push(`print(f"Soda Scan Result: {scan_result}")`);
      lines.push(``);
      if (failOnError) {
        lines.push(`# Fail pipeline if checks fail`);
        lines.push(`if scan.has_check_fails():`);
        lines.push(`    raise ValueError("Soda Core checks failed")`);
        lines.push(``);
      }
      lines.push(`${varName} = ${inputVarName}  # Data validated with Soda Core`);
      return true;
    }

    case 'dataAssertions': {
      const assertions = config.assertions as Array<{
        name: string;
        type: string;
        column?: string;
        condition?: string;
        minValue?: number;
        maxValue?: number;
        allowedValues?: string;
        pattern?: string;
      }> || [];
      const failOnError = config.failOnError as boolean ?? true;
      const addResultColumn = config.addResultColumn as boolean ?? false;
      const resultColumn = config.resultColumn as string || 'assertion_results';

      lines.push(`# Built-in Data Assertions`);
      lines.push(`from pyspark.sql import functions as F`);
      lines.push(``);
      lines.push(`# Define assertions`);
      lines.push(`assertion_results = []`);
      lines.push(``);

      if (assertions.length > 0) {
        assertions.forEach((assertion, idx) => {
          const name = assertion.name || `assertion_${idx + 1}`;
          lines.push(`# Assertion ${idx + 1}: ${name}`);

          switch (assertion.type) {
            case 'not_null':
              lines.push(`null_count_${idx} = ${inputVarName}.filter(F.col("${assertion.column}").isNull()).count()`);
              lines.push(`assertion_results.append({"name": "${name}", "passed": null_count_${idx} == 0, "details": f"Null count: {null_count_${idx}}"})`);
              break;
            case 'unique':
              lines.push(`total_${idx} = ${inputVarName}.count()`);
              lines.push(`distinct_${idx} = ${inputVarName}.select("${assertion.column}").distinct().count()`);
              lines.push(`assertion_results.append({"name": "${name}", "passed": total_${idx} == distinct_${idx}, "details": f"Total: {total_${idx}}, Distinct: {distinct_${idx}}"})`);
              break;
            case 'in_range':
              lines.push(`out_of_range_${idx} = ${inputVarName}.filter((F.col("${assertion.column}") < ${assertion.minValue || 0}) | (F.col("${assertion.column}") > ${assertion.maxValue || 100})).count()`);
              lines.push(`assertion_results.append({"name": "${name}", "passed": out_of_range_${idx} == 0, "details": f"Out of range: {out_of_range_${idx}}"})`);
              break;
            case 'in_set': {
              const allowedVals = assertion.allowedValues?.split(',').map(v => `"${v.trim()}"`).join(', ') || '';
              lines.push(`invalid_${idx} = ${inputVarName}.filter(~F.col("${assertion.column}").isin([${allowedVals}])).count()`);
              lines.push(`assertion_results.append({"name": "${name}", "passed": invalid_${idx} == 0, "details": f"Invalid values: {invalid_${idx}}"})`);
              break;
            }
            case 'regex':
              lines.push(`non_matching_${idx} = ${inputVarName}.filter(~F.col("${assertion.column}").rlike("${assertion.pattern || '.*'}")).count()`);
              lines.push(`assertion_results.append({"name": "${name}", "passed": non_matching_${idx} == 0, "details": f"Non-matching: {non_matching_${idx}}"})`);
              break;
            case 'custom':
              lines.push(`failing_${idx} = ${inputVarName}.filter(~(${assertion.condition || 'F.lit(True)'})).count()`);
              lines.push(`assertion_results.append({"name": "${name}", "passed": failing_${idx} == 0, "details": f"Failing rows: {failing_${idx}}"})`);
              break;
          }
          lines.push(``);
        });
      } else {
        lines.push(`# No assertions defined - add assertions in configuration`);
        lines.push(`# Example: {"name": "id_not_null", "type": "not_null", "column": "id"}`);
      }

      lines.push(`# Check all assertions`);
      lines.push(`all_passed = all(r["passed"] for r in assertion_results)`);
      lines.push(`for result in assertion_results:`);
      lines.push(`    status = "PASSED" if result["passed"] else "FAILED"`);
      lines.push(`    print(f"  {result['name']}: {status} - {result['details']}")`);
      lines.push(``);

      if (failOnError) {
        lines.push(`# Fail pipeline if any assertion fails`);
        lines.push(`if not all_passed:`);
        lines.push(`    failed = [r["name"] for r in assertion_results if not r["passed"]]`);
        lines.push(`    raise ValueError(f"Data assertions failed: {failed}")`);
        lines.push(``);
      }

      if (addResultColumn) {
        lines.push(`# Add assertion result column`);
        lines.push(`${varName} = ${inputVarName}.withColumn("${resultColumn}", F.lit(all_passed))`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Data assertions completed`);
      }
      return true;
    }

    case 'schemaValidation': {
      const expectedSchema = config.expectedSchema as Array<{name: string; type: string; nullable: boolean}> || [];
      const strictMode = config.strictMode as boolean ?? false;
      const failOnError = config.failOnError as boolean ?? true;
      const checkNullability = config.checkNullability as boolean ?? true;

      lines.push(`# Schema Validation`);
      lines.push(`from pyspark.sql.types import *`);
      lines.push(``);

      if (expectedSchema.length > 0) {
        lines.push(`# Define expected schema`);
        lines.push(`expected_schema = StructType([`);
        expectedSchema.forEach((col, idx) => {
          const comma = idx < expectedSchema.length - 1 ? ',' : '';
          const pyType = mapDataTypeToPySpark(col.type);
          lines.push(`    StructField("${col.name}", ${pyType}, ${col.nullable ? 'True' : 'False'})${comma}`);
        });
        lines.push(`])`);
        lines.push(``);
        lines.push(`# Get actual schema`);
        lines.push(`actual_schema = ${inputVarName}.schema`);
        lines.push(``);
        lines.push(`# Validate schema`);
        lines.push(`schema_errors = []`);
        lines.push(`expected_fields = {f.name: f for f in expected_schema.fields}`);
        lines.push(`actual_fields = {f.name: f for f in actual_schema.fields}`);
        lines.push(``);
        lines.push(`# Check for missing columns`);
        lines.push(`missing_cols = set(expected_fields.keys()) - set(actual_fields.keys())`);
        lines.push(`if missing_cols:`);
        lines.push(`    schema_errors.append(f"Missing columns: {missing_cols}")`);
        lines.push(``);

        if (strictMode) {
          lines.push(`# Check for extra columns (strict mode)`);
          lines.push(`extra_cols = set(actual_fields.keys()) - set(expected_fields.keys())`);
          lines.push(`if extra_cols:`);
          lines.push(`    schema_errors.append(f"Extra columns not in schema: {extra_cols}")`);
          lines.push(``);
        }

        lines.push(`# Check column types`);
        lines.push(`for col_name, expected_field in expected_fields.items():`);
        lines.push(`    if col_name in actual_fields:`);
        lines.push(`        actual_field = actual_fields[col_name]`);
        lines.push(`        if str(actual_field.dataType) != str(expected_field.dataType):`);
        lines.push(`            schema_errors.append(f"Column '{col_name}' type mismatch: expected {expected_field.dataType}, got {actual_field.dataType}")`);

        if (checkNullability) {
          lines.push(`        if actual_field.nullable != expected_field.nullable:`);
          lines.push(`            schema_errors.append(f"Column '{col_name}' nullability mismatch: expected {expected_field.nullable}, got {actual_field.nullable}")`);
        }

        lines.push(``);
        lines.push(`# Report results`);
        lines.push(`if schema_errors:`);
        lines.push(`    print("Schema Validation FAILED:")`);
        lines.push(`    for error in schema_errors:`);
        lines.push(`        print(f"  - {error}")`);
        if (failOnError) {
          lines.push(`    raise ValueError(f"Schema validation failed with {len(schema_errors)} errors")`);
        }
        lines.push(`else:`);
        lines.push(`    print("Schema Validation PASSED")`);
      } else {
        lines.push(`# No expected schema defined - printing actual schema`);
        lines.push(`print("Actual Schema:")`);
        lines.push(`${inputVarName}.printSchema()`);
      }

      lines.push(``);
      lines.push(`${varName} = ${inputVarName}  # Schema validation completed`);
      return true;
    }

    default:
      return false;
  }
};
