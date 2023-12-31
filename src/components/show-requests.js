import ShowRequestTbody from './show-requests-tbody.js'

function ShowRequests(props) {

	function addToFamily(id, name, recordID) {
		props.addToFamily(id, name, recordID)
	}

	function removeFromFamily(id) {
		props.removeFromFamily(id)
	}

	function closeRequests() {
		props.closeRequests()
	}

	const familyMembers = props.familyMembers
	let rows = []
	for (let i = 0; i < props.familyRequests.length; i++) {
		const data = props.familyRequests[i]
		let countThisEntry = 1
		for (let j = 0; j < familyMembers.length; j++) {
			if (familyMembers[j].id == data.id) {
				countThisEntry = 0
			}
		}
		if (countThisEntry) {
			rows.push(<ShowRequestTbody onApprovalSubmit={addToFamily} onRejectionSubmit={removeFromFamily} key={i} recordId={data._recordId} id={data.id} name={data.name} request_date={data.request_date} />);
		}

	}

	return (
		<div className="container">
			<p>&nbsp;</p>
			<h1>Approve or Reject New User</h1>
			<button type="submit" onClick={closeRequests} className="btn btn-primary">Go back</button>
			<p>&nbsp;</p>
			<table className="table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Date</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
		</div>
	);
}
export default ShowRequests;