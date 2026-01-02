import { generateSchemaCode } from '../helpers';

// Generate code for file-based sources (csv, parquet, json, orc, avro, text, excel, xml)
export const generateFileSourceCode = (
  sourceType: string,
  varName: string,
  config: Record<string, unknown>,
  schema: { name: string; dataType: string; nullable?: boolean }[] | undefined,
  lines: string[]
): boolean => {
  switch (sourceType) {
    case 'csv': {
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("csv") \\`);
      lines.push(`    .option("path", "${config.path || 'path/to/data.csv'}") \\`);
      lines.push(`    .option("header", ${config.header !== false ? 'True' : 'False'}) \\`);
      if (!config.ddlSchema) {
        lines.push(`    .option("inferSchema", ${config.inferSchema ? 'True' : 'False'}) \\`);
      }
      if (config.delimiter && config.delimiter !== ',') {
        lines.push(`    .option("sep", "${config.delimiter}") \\`);
      }
      if (config.quote && config.quote !== '"') {
        lines.push(`    .option("quote", "${config.quote}") \\`);
      }
      if (config.escape) {
        lines.push(`    .option("escape", "${config.escape}") \\`);
      }
      if (config.nullValue) {
        lines.push(`    .option("nullValue", "${config.nullValue}") \\`);
      }
      if (config.dateFormat) {
        lines.push(`    .option("dateFormat", "${config.dateFormat}") \\`);
      }
      if (config.timestampFormat) {
        lines.push(`    .option("timestampFormat", "${config.timestampFormat}") \\`);
      }
      if (config.encoding && config.encoding !== 'UTF-8') {
        lines.push(`    .option("encoding", "${config.encoding}") \\`);
      }
      if (config.mode && config.mode !== 'PERMISSIVE') {
        lines.push(`    .option("mode", "${config.mode}") \\`);
      }
      if (config.multiLine) {
        lines.push(`    .option("multiLine", True) \\`);
      }
      if (config.ignoreLeadingWhiteSpace) {
        lines.push(`    .option("ignoreLeadingWhiteSpace", True) \\`);
      }
      if (config.ignoreTrailingWhiteSpace) {
        lines.push(`    .option("ignoreTrailingWhiteSpace", True) \\`);
      }
      if (config.ddlSchema) {
        lines.push(`    .schema("${config.ddlSchema}") \\`);
      }
      lines.push(`    .load()`);
      return true;
    }

    case 'parquet': {
      // Generate schema if useSchema is enabled and columns are defined
      const parquetSchema = schema ?? [];
      const hasSchemaParquet = config.useSchema && parquetSchema.length > 0;
      if (hasSchemaParquet) {
        const schemaLines = generateSchemaCode(parquetSchema, varName);
        lines.push(...schemaLines);
      }

      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("parquet") \\`);
      if (hasSchemaParquet) {
        lines.push(`    .schema(${varName}_schema) \\`);
      } else if (config.ddlSchema) {
        lines.push(`    .schema("${config.ddlSchema}") \\`);
      }
      if (config.mergeSchema) {
        lines.push(`    .option("mergeSchema", True) \\`);
      }
      if (config.pathGlobFilter) {
        lines.push(`    .option("pathGlobFilter", "${config.pathGlobFilter}") \\`);
      }
      if (config.recursiveFileLookup) {
        lines.push(`    .option("recursiveFileLookup", True) \\`);
      }
      lines.push(`    .load("${config.path || 'path/to/data.parquet'}")`);
      return true;
    }

    case 'json': {
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("json") \\`);
      if (config.multiLine) {
        lines.push(`    .option("multiLine", True) \\`);
      }
      if (config.inferSchema === false) {
        lines.push(`    .option("inferSchema", False) \\`);
      }
      if (config.primitivesAsString) {
        lines.push(`    .option("primitivesAsString", True) \\`);
      }
      if (config.allowComments) {
        lines.push(`    .option("allowComments", True) \\`);
      }
      if (config.allowUnquotedFieldNames) {
        lines.push(`    .option("allowUnquotedFieldNames", True) \\`);
      }
      if (config.dateFormat) {
        lines.push(`    .option("dateFormat", "${config.dateFormat}") \\`);
      }
      if (config.timestampFormat) {
        lines.push(`    .option("timestampFormat", "${config.timestampFormat}") \\`);
      }
      if (config.mode && config.mode !== 'PERMISSIVE') {
        lines.push(`    .option("mode", "${config.mode}") \\`);
      }
      if (config.ddlSchema) {
        lines.push(`    .schema("${config.ddlSchema}") \\`);
      }
      lines.push(`    .load("${config.path || 'path/to/data.json'}")`);
      return true;
    }

    case 'orc': {
      // Generate schema if useSchema is enabled and columns are defined
      const orcSchema = schema ?? [];
      const hasSchemaOrc = config.useSchema && orcSchema.length > 0;
      if (hasSchemaOrc) {
        const schemaLines = generateSchemaCode(orcSchema, varName);
        lines.push(...schemaLines);
      }

      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("orc") \\`);
      if (hasSchemaOrc) {
        lines.push(`    .schema(${varName}_schema) \\`);
      } else if (config.ddlSchema) {
        lines.push(`    .schema("${config.ddlSchema}") \\`);
      }
      if (config.mergeSchema) {
        lines.push(`    .option("mergeSchema", True) \\`);
      }
      if (config.pathGlobFilter) {
        lines.push(`    .option("pathGlobFilter", "${config.pathGlobFilter}") \\`);
      }
      if (config.recursiveFileLookup) {
        lines.push(`    .option("recursiveFileLookup", True) \\`);
      }
      lines.push(`    .load("${config.path || 'path/to/data.orc'}")`);
      return true;
    }

    case 'avro': {
      // Generate schema if useSchema is enabled and columns are defined
      const avroSchema = schema ?? [];
      const hasSchemaAvro = config.useSchema && avroSchema.length > 0;
      if (hasSchemaAvro) {
        const schemaLines = generateSchemaCode(avroSchema, varName);
        lines.push(...schemaLines);
      }

      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("avro") \\`);
      if (hasSchemaAvro) {
        lines.push(`    .schema(${varName}_schema) \\`);
      } else if (config.ddlSchema) {
        lines.push(`    .schema("${config.ddlSchema}") \\`);
      }
      if (config.mergeSchema) {
        lines.push(`    .option("mergeSchema", True) \\`);
      }
      if (config.avroSchema) {
        lines.push(`    .option("avroSchema", '''${config.avroSchema}''') \\`);
      }
      if (config.ignoreExtension) {
        lines.push(`    .option("ignoreExtension", True) \\`);
      }
      if (config.pathGlobFilter) {
        lines.push(`    .option("pathGlobFilter", "${config.pathGlobFilter}") \\`);
      }
      if (config.recursiveFileLookup) {
        lines.push(`    .option("recursiveFileLookup", True) \\`);
      }
      lines.push(`    .load("${config.path || 'path/to/data.avro'}")`);
      return true;
    }

    case 'text': {
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("text") \\`);
      if (config.wholetext) {
        lines.push(`    .option("wholetext", True) \\`);
      }
      if (config.lineSep && config.lineSep !== '\\n') {
        lines.push(`    .option("lineSep", "${config.lineSep}") \\`);
      }
      if (config.pathGlobFilter) {
        lines.push(`    .option("pathGlobFilter", "${config.pathGlobFilter}") \\`);
      }
      if (config.recursiveFileLookup) {
        lines.push(`    .option("recursiveFileLookup", True) \\`);
      }
      lines.push(`    .load("${config.path || 'path/to/data.txt'}")`);
      return true;
    }

    case 'excel': {
      lines.push(`# Requires: spark-excel package`);
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("com.crealytics.spark.excel") \\`);
      lines.push(`    .option("header", ${config.header !== false ? 'True' : 'False'}) \\`);
      lines.push(`    .option("inferSchema", ${config.inferSchema !== false ? 'True' : 'False'}) \\`);
      if (config.sheetName) {
        lines.push(`    .option("sheetName", "${config.sheetName}") \\`);
      }
      if (config.dataAddress) {
        lines.push(`    .option("dataAddress", "${config.dataAddress}") \\`);
      }
      if (config.treatEmptyValuesAsNulls !== false) {
        lines.push(`    .option("treatEmptyValuesAsNulls", True) \\`);
      }
      if (config.maxRowsPerSheet) {
        lines.push(`    .option("maxRowsPerSheet", ${config.maxRowsPerSheet}) \\`);
      }
      lines.push(`    .load("${config.path || 'path/to/data.xlsx'}")`);
      return true;
    }

    case 'xml': {
      lines.push(`# Requires: spark-xml package`);
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("xml") \\`);
      lines.push(`    .option("rowTag", "${config.rowTag || 'row'}") \\`);
      if (config.rootTag) {
        lines.push(`    .option("rootTag", "${config.rootTag}") \\`);
      }
      if (config.inferSchema === false) {
        lines.push(`    .option("inferSchema", False) \\`);
      }
      if (config.excludeAttribute) {
        lines.push(`    .option("excludeAttribute", True) \\`);
      }
      if (config.attributePrefix && config.attributePrefix !== '_') {
        lines.push(`    .option("attributePrefix", "${config.attributePrefix}") \\`);
      }
      if (config.valueTag && config.valueTag !== '_VALUE') {
        lines.push(`    .option("valueTag", "${config.valueTag}") \\`);
      }
      if (config.nullValue) {
        lines.push(`    .option("nullValue", "${config.nullValue}") \\`);
      }
      if (config.ddlSchema) {
        lines.push(`    .schema("${config.ddlSchema}") \\`);
      }
      lines.push(`    .load("${config.path || 'path/to/data.xml'}")`);
      return true;
    }

    default:
      return false;
  }
};
