export default function ShowRequestTbody(props) {

	const data = props.data

	let nfObject = new Intl.NumberFormat('en-US')
	let formattedAmt = nfObject.format(data.amount)

	return (
		<>
			<tr>
				<td>
					<h4>{data.expenseDetails}</h4>
					<p>By: {data.writerName} under <strong>{data.expenseType}</strong></p>
				</td>
				<td>
					<strong>$ {formattedAmt}</strong>
					<br />
					on {data.date}
				</td>
			</tr>
		</>
	)
}