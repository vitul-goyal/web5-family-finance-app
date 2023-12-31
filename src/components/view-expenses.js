import ShowExpenseBody from './show-expense-tbody.js'

function ViewExpenses(props) {

	const familyName = props.familyName
	const familyMembers = props.familyMembers
	const myDid = props.myDid
	const familyRequests = props.familyRequests
	const allExpenses = props.allExpenses
	let isAdmin = false

	let myName, familyID
	for (let i = 0; i < familyMembers.length; i++) {
		if (familyMembers[i].id == myDid) {
			myName = familyMembers[i].name
		}
		if (familyMembers[i].isAdmin) {
			familyID = familyMembers[i].id
		}
	}

	let pendingRequests = 0
	for (let i = 0; i < familyRequests.length; i++) {
		const data = familyRequests[i]
		let countThisEntry = 1
		for (let j = 0; j < familyMembers.length; j++) {
			if (familyMembers[j].id == data.id) {
				countThisEntry = 0
			}
		}
		if (countThisEntry) {
			pendingRequests++
		}
	}

	if (familyID == myDid) {
		isAdmin = true
	}

	const viewRequestsSubmit = async (e) => {
		e.preventDefault();
		props.onViewRequestsSubmit()
	};

	const addExpenseSubmit = async (e) => {
		e.preventDefault();
		props.onAddExpenseSubmit()
	};
	const removeAllMessages = async (e) => {
		e.preventDefault()
		props.removeAllMessages()
	};

	let rows = []
	let totalAmt = 0
	for (let i = 0; i < allExpenses.length; i++) {
		const data = allExpenses[i]
		rows.push(<ShowExpenseBody key={i} data={data} />)
		totalAmt += parseFloat(data.amount)
	}
	let nfObject = new Intl.NumberFormat('en-US')
	let formattedAmt = nfObject.format(totalAmt)

	const copyFamilyID = () => {
		// save to clipboard
		navigator.clipboard.writeText(familyID)
	};

	return (
		<div className="container">
			<p>&nbsp;</p>
			<h1>Welcome, {myName}</h1>
			<p>
				<strong>Family ID:</strong>
				&nbsp;&nbsp;
				<input readOnly type="text" value={familyID} />
				&nbsp;&nbsp;
				<button onClick={copyFamilyID} className="btn">Copy</button>
			</p>
			{isAdmin ?
				<>
					<button onClick={viewRequestsSubmit} className="btn btn-primary">View Requests ({pendingRequests})</button>&nbsp;&nbsp;&nbsp;
				</>
				: ""
			}
			<button type="submit" onClick={addExpenseSubmit} className="btn btn-primary">Add Expense</button>

			<p>&nbsp;</p>
			<table className="table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Expense</th>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
				<tfoot>
					<tr>
						<th>Total:</th>
						<th id="totalExpense">$ {formattedAmt}</th>
					</tr>
				</tfoot>
			</table>

			{/* <p>&nbsp;</p>
			<button type="submit" onClick={removeAllMessages} className="btn btn-danger">
				{
					isAdmin ? "Delete Group" : "Leave Group"
				}
			</button> */}

			<p>&nbsp;</p>
			<div className="form-group">
				<h3>
					<strong>Future Scope:</strong>
				</h3>
				<p>
					<ul>
						<li>List of family members</li>
						<li>Member wise expenses</li>
						<li>Date/Month filters</li>
						<li>Category wise expenses view</li>
						<li>Summary of expenses using AI</li>
						<li>Ability to add recurring expenses</li>
						<li>Set member wise monthly budgets</li>
					</ul>
				</p>
			</div>

		</div>
	)
}
export default ViewExpenses;