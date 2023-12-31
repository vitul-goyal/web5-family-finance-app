export default function ShowRequestTbody(props) {

	function addToFamily() {
		props.onApprovalSubmit(props.id, props.name, props.recordId)
	}

	function removeFromFamily() {
		props.onRejectionSubmit(props.recordId)
	}

	return (
		<>
			<tr>
				<td>{props.name}</td>
				<td>{props.request_date}</td>
				<td>
					<button className="btn btn-success" onClick={addToFamily}>Approve</button>
					&nbsp;&nbsp;
					<button className="btn btn-danger" onClick={removeFromFamily}>Reject</button>
				</td>
			</tr>
		</>
	)
}