// Purpose: To create a new family group or join an existing family group
function FamilyForm(props) {
	const createNewFamilySubmit = async (e) => {
		e.preventDefault()
		props.onNewFamilySubmit(e.target.form.familyName.value, e.target.form.adminName.value)
	};
	const joinFamilySubmit = async (e) => {
		e.preventDefault()
		props.onJoinFamilySubmit(e.target.form.familyId.value, e.target.form.personName.value)
	};
	const removeAllMessages = async (e) => {
		e.preventDefault()
		props.removeAllMessages()
	};

	let familyRequestedMsg = ""
	if (props.familyRequested) {
		familyRequestedMsg = `Request sent. Please wait for admin approval.`
	}

	return (
		<div className="container">
			<p>&nbsp;</p>
			<h2>Create New Family Group</h2>

			{/* Form to ask for Name of family and name of Admin */}
			<form>
				<div className="form-group">
					<label htmlFor="familyName">Family Name:</label>
					<input type="text" className="form-control" id="familyName" placeholder="Enter Family Name" />
				</div>
				<div className="form-group">
					<label htmlFor="adminName">My Name:</label>
					<input type="text" className="form-control" id="adminName" placeholder="Enter Name" />
				</div>
				<button type="submit" onClick={createNewFamilySubmit} className="btn btn-primary">Create</button>
			</form>
			<p>&nbsp;</p>
			<h2>-- OR --</h2>
			<p>&nbsp;</p>
			<h2>Join a Family Group</h2>
			{/* Form to ask for family id and name of person */}
			<form>
				<div className="form-group">
					<label htmlFor="familyId">Family ID:</label>
					<input type="text" className="form-control" id="familyId" placeholder="Enter Family ID" />
				</div>
				<div className="form-group">
					<label htmlFor="personName">My Name:</label>
					<input type="text" className="form-control" id="personName" placeholder="Enter Name" />
				</div>
				<button type="submit" onClick={joinFamilySubmit} className="btn btn-primary">Request</button>
				&nbsp;&nbsp;
				<button type="submit" onClick={removeAllMessages} className="btn btn-danger">Delete data</button>
				<p>{familyRequestedMsg}</p>
			</form>
		</div>
	);
}

export default FamilyForm;