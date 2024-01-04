function AddExpense(props) {

	function closeRequests() {
		props.closeRequests()
	}

	function saveNewExpense(e) {
		e.preventDefault();
		props.saveNewExpense(e.target.form.date.value, e.target.form.expenseType.value, e.target.form.expenseDetails.value, e.target.form.amount.value)
	}

	// current date only
	let today = new Date().toISOString().slice(0, 10);
	const expensesAdditionRequested = props.expensesAdditionRequested

	return (
		<div className="container">
			<p>&nbsp;</p>
			<h1>Add New Expense</h1>
			<button type="submit" onClick={closeRequests} className="btn btn-primary">Go back</button>
			<p>&nbsp;</p>
			<form>
				<div className="form-group">
					<label htmlFor="date">Date:</label>
					<input type="date" className="form-control" id="date" placeholder="Select date" value={today} />
				</div>

				<div className="form-group">
					<label htmlFor="expenseType">Type of Expense:</label>
					<select className="form-control" id="expenseType">
						<option value="Business">Business</option>
						<option value="Clothes">Clothes</option>
						<option value="Eating Out">Eating Out</option>
						<option value="Entertainment">Entertainment</option>
						<option value="Fuel">Fuel</option>
						<option value="General">General</option>
						<option value="Gifts">Gifts</option>
						<option value="Holidays">Holidays</option>
						<option value="Sports">Sports</option>
						<option value="Transportation">Transportation</option>
						<option value="Utilities">Utilities</option>
						{/* Add more options as needed */}
					</select>
				</div>

				<div className="form-group">
					<label htmlFor="expenseDetails">Details of Expense:</label>
					<textarea className="form-control" id="expenseDetails" rows="3"></textarea>
				</div>

				<div className="form-group">
					<label htmlFor="amount">Amount (in dollars):</label>
					<input type="number" className="form-control" id="amount" placeholder="Enter amount" />
				</div>
				{
					!expensesAdditionRequested ? <button type="submit" onClick={saveNewExpense} className="btn btn-primary">Add Expense</button> : ""
				}
			</form>
		</div>
	)
}

export default AddExpense;