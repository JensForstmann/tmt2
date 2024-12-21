export type SqlAttribute = {
	name: string;
	type: string;
	constraints?: string;
};

export class TableSchema {
	/*
	 * Represents a table in a SQL database.
	 */
	tableName: string;
	attributes: SqlAttribute[];
	primaryKey?: string[];

	constructor(tableName: string, attributes: SqlAttribute[], primaryKey?: string[]) {
		this.tableName = tableName;
		this.attributes = attributes;
		this.primaryKey = primaryKey;
	}

	generateCreateTableParameters(): string {
		/*
		 * Generates the parameters for a CREATE TABLE SQL statement.
		 */
		const attributes = this.attributes
			.map((att) => `${att.name} ${att.type}${att.constraints ? ` ${att.constraints}` : ''}`)
			.join(', ');

		const primaryKeyDefinition = this.primaryKey
			? `, PRIMARY KEY (${this.primaryKey.join(', ')})`
			: '';

		return `(${attributes}${primaryKeyDefinition});`;
	}
}
