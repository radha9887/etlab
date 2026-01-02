// Generate code for UDF transforms (pythonUdf, pandasUdf, pandasGroupedUdf)
export const generateUdfTransformCode = (
  transformType: string,
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (transformType) {
    case 'pythonUdf': {
      const functionName = config.functionName as string || 'my_udf';
      const inputColumns = config.inputColumns as string[] || [];
      const outputColumn = config.outputColumn as string || 'udf_result';
      const returnType = config.returnType as string || 'StringType()';
      const functionCode = config.functionCode as string || `def my_udf(value):
    return str(value).upper()`;

      lines.push(`# Python UDF - Row-by-row transformation`);
      lines.push(`from pyspark.sql.functions import udf, col`);
      lines.push(`from pyspark.sql.types import ${returnType.split('(')[0]}`);
      lines.push(``);
      lines.push(`# Define the UDF function`);
      lines.push(functionCode);
      lines.push(``);
      lines.push(`# Register the UDF`);
      lines.push(`${functionName}_udf = udf(${functionName}, ${returnType})`);
      lines.push(``);

      if (inputColumns.length === 0) {
        lines.push(`# Apply UDF (no input columns specified)`);
        lines.push(`${varName} = ${inputVarName}`);
      } else if (inputColumns.length === 1) {
        lines.push(`# Apply UDF to column`);
        lines.push(`${varName} = ${inputVarName}.withColumn("${outputColumn}", ${functionName}_udf(col("${inputColumns[0]}")))`);
      } else {
        const colArgs = inputColumns.map(c => `col("${c}")`).join(', ');
        lines.push(`# Apply UDF to multiple columns`);
        lines.push(`${varName} = ${inputVarName}.withColumn("${outputColumn}", ${functionName}_udf(${colArgs}))`);
      }
      return true;
    }

    case 'pandasUdf': {
      const functionName = config.functionName as string || 'pandas_udf';
      const inputColumns = config.inputColumns as string[] || [];
      const outputColumn = config.outputColumn as string || 'pandas_result';
      const returnType = config.returnType as string || 'StringType()';
      const functionCode = config.functionCode as string || `@pandas_udf(StringType())
def pandas_udf(series: pd.Series) -> pd.Series:
    return series.str.upper()`;

      lines.push(`# Pandas UDF (Scalar) - Vectorized transformation`);
      lines.push(`import pandas as pd`);
      lines.push(`from pyspark.sql.functions import pandas_udf, col`);
      lines.push(`from pyspark.sql.types import ${returnType.split('(')[0]}`);
      lines.push(``);
      lines.push(`# Define the Pandas UDF`);
      lines.push(functionCode);
      lines.push(``);

      if (inputColumns.length === 0) {
        lines.push(`# Apply Pandas UDF (no input columns specified)`);
        lines.push(`${varName} = ${inputVarName}`);
      } else if (inputColumns.length === 1) {
        lines.push(`# Apply Pandas UDF to column`);
        lines.push(`${varName} = ${inputVarName}.withColumn("${outputColumn}", ${functionName}(col("${inputColumns[0]}")))`);
      } else {
        const colArgs = inputColumns.map(c => `col("${c}")`).join(', ');
        lines.push(`# Apply Pandas UDF to multiple columns`);
        lines.push(`${varName} = ${inputVarName}.withColumn("${outputColumn}", ${functionName}(${colArgs}))`);
      }
      return true;
    }

    case 'pandasGroupedUdf': {
      const functionName = config.functionName as string || 'grouped_udf';
      const groupByColumns = config.groupByColumns as string[] || [];
      const outputSchema = config.outputSchema as Array<{name: string; type: string}> || [];
      const functionCode = config.functionCode as string || `def grouped_udf(pdf: pd.DataFrame) -> pd.DataFrame:
    return pdf`;

      lines.push(`# Pandas Grouped Map UDF - Apply function to each group`);
      lines.push(`import pandas as pd`);
      lines.push(`from pyspark.sql.functions import pandas_udf, PandasUDFType`);
      lines.push(`from pyspark.sql.types import StructType, StructField, ${[...new Set(outputSchema.map(s => s.type.split('(')[0]))].join(', ')}`);
      lines.push(``);

      // Build output schema
      if (outputSchema.length > 0) {
        lines.push(`# Define output schema`);
        lines.push(`output_schema = StructType([`);
        outputSchema.forEach((col, idx) => {
          const comma = idx < outputSchema.length - 1 ? ',' : '';
          lines.push(`    StructField("${col.name}", ${col.type})${comma}`);
        });
        lines.push(`])`);
        lines.push(``);
      }

      lines.push(`# Define the Grouped Map UDF`);
      lines.push(functionCode);
      lines.push(``);

      if (groupByColumns.length === 0) {
        lines.push(`# Apply Grouped Map UDF (no groupBy specified)`);
        lines.push(`${varName} = ${inputVarName}`);
      } else {
        const groupCols = groupByColumns.map(c => `"${c}"`).join(', ');
        lines.push(`# Apply Grouped Map UDF`);
        lines.push(`${varName} = ${inputVarName}.groupBy(${groupCols}).applyInPandas(${functionName}, schema=output_schema)`);
      }
      return true;
    }

    default:
      return false;
  }
};
