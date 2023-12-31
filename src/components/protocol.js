export default function protocol() {
	const protocolName = "https://per-fin.com/finance-protocol"
	const sc_1 = "https://per-fin.com/schemas/familySchema"
	const sc_2 = "https://per-fin.com/schemas/expenseSchema"
	const sc_3 = "https://per-fin.com/schemas/requestSchema"

	const protocolDefinition = {
		"protocol": protocolName,
		"published": true,
		"types": {
			"family": {
				"schema": sc_1,
				"dataFormats": ["application/json"]
			},
			"expense": {
				"schema": sc_2,
				"dataFormats": ["application/json"]
			},
			"request": {
				"schema": sc_3,
				"dataFormats": ["application/json"]
			}
		},
		"structure": {
			"family": {
				"$actions": [
					{
						"who": "anyone",
						"can": "read"
					},
					{
						"who": "anyone",
						"can": "write"
					}
				]
			},
			"expense": {
				"$actions": [
					{
						"who": "anyone",
						"can": "read"
					},
					{
						"who": "anyone",
						"can": "write"
					}
				]
			},
			"request": {
				"$actions": [
					{
						"who": "anyone",
						"can": "read"
					},
					{
						"who": "anyone",
						"can": "write"
					}
				]
			}
		}
	}
	return protocolDefinition;
}