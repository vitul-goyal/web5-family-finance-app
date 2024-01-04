"use client";
import { Web5 } from '@web5/api'
import { useState, useEffect } from "react"
import protocolJson from '../components/protocol.js'
import FamilyForm from '../components/create-family.js'
import ViewExpenses from '../components/view-expenses.js'
import ShowRequests from '../components/show-requests.js'
import AddExpense from '../components/add-expense.js'
import { v4 as uuidv4 } from 'uuid'

export default function Home() {

	// initial
	const [web5, setWeb5] = useState(null);
	const [did, setDid] = useState(null);
	const [protocolDef, setDefinition] = useState(null);

	// check if family
	const [isFamily, setFamilyFound] = useState(0);
	const [isAdmin, setAdmin] = useState(0);
	const [familyName, setFamilyName] = useState(null);
	const [familyMembers, setFamilyMembers] = useState(null);

	// family requests
	const [familyRequested, setFamilyRequested] = useState(null);
	const [familyRequests, setFamilyRequests] = useState([]);
	const [showRequests, setShowRequests] = useState(null);

	// Expense management
	const [addExpense, setAddExpense] = useState(null);
	const [allExpenses, setAllExpenses] = useState([]);

	const protocolDefinition = protocolJson()
	useEffect(() => {
		const initWeb5 = async () => {
			console.log("Initializing Web5")
			const { web5, did } = await Web5.connect()
			setDid(did)
			setWeb5(web5)
			setDefinition(protocolDefinition)

			if (web5 && did) {
				await installProtocol(web5, did, protocolDefinition)
				await checkIfFamily(web5, did, protocolDefinition)
			}
		};
		initWeb5();
	}, []);

	useEffect(() => {
		if (!web5 || !did) return;
		const intervalId = setInterval(async () => {
			if (isFamily == 2) {
				// waiting to be added to family or if already added to family, then check if new member is added.
				await checkIfAddedToFamily(web5, did, protocolDef)
			}
			if (isFamily == 1 && isAdmin == 1) {
				await checkForNewRequests(web5, did);
			}
		}, 2000);
		return () => clearInterval(intervalId);
	}, [web5, did, isFamily, protocolDef]);

	useEffect(() => {
		if (!web5 || !did) return;
		const intervalId = setInterval(async () => {
			if (isFamily == 1) {
				await fetchAllExpense(web5, did, familyMembers, 0, allExpenses);
				if (!isAdmin) {
					await checkIfAddedToFamily(web5, did, protocolDef);
				}
			}
		}, 5000);
		return () => clearInterval(intervalId);
	}, [web5, did, isFamily, familyMembers, protocolDef, allExpenses]);

	// install protocol
	const installProtocol = async (web5, did, protocolDefinition) => {
		if (web5) {
			const { protocol, status } = await web5.dwn.protocols.configure({
				message: {
					definition: protocolDefinition
				}
			});
			// console.log("Protocol installed with status", status)
			//sends protocol to remote DWNs immediately
			await protocol.send(did)
		}
	}

	const removeAllMessages = async () => {
		const response = await web5.dwn.records.query({
			message: {
				filter: {
					protocol: protocolDefinition.protocol
				},
			},
		})
		for (let i = 0; i < response.records.length; i++) {
			const recordId = response.records[i]._recordId
			const r = await web5.dwn.records.delete({
				message: {
					recordId: recordId,
				},
			});
			console.log(r)
		}

		const response_2 = await web5.dwn.records.query({
			from: did,
			message: {
				filter: {
					protocol: protocolDefinition.protocol
				},
			},
		})
		for (let i = 0; i < response_2.records.length; i++) {
			const recordId = response_2.records[i]._recordId
			const r = await web5.dwn.records.delete({
				from: did,
				message: {
					recordId: recordId,
				},
			});
			console.log(r)
		}
		console.log("Removed")
		// Refresh the page
		location.reload();
	}


	// step 1: check if the user a family
	const checkIfFamily = async (web5, did, protocolDefinition) => {
		if (web5) {
			console.log("Checking for family")
			const response = await web5.dwn.records.query({
				message: {
					filter: {
						protocol: protocolDefinition.protocol,
						schema: protocolDefinition.types.family.schema
					},
				},
			})

			// if yes, load the family
			await loadFamily(did, response, web5)
		}
	}

	// step 2: if yes, load the family
	const loadFamily = async (did, response, web5) => {
		let familyFound = 0

		console.log("LOAD FAMILY FUNCTION. RECORDS: ", response.records.length)
		for (let i = 0; i < response.records.length; i++) {
			const data = await response.records[i].data.json()
			console.log(data)
			for (let i = 0; i < data.members.length; i++) {
				if (data.members[i].id == did) {
					familyFound = 1
					if (data.members[i].isAdmin) {
						setAdmin(1)
					}
				}
			}
			console.log({ familyFound })

			if (familyFound) {
				setFamilyName(data.familyName)
				setFamilyMembers(data.members)
				setFamilyFound(1)
				await fetchAllExpense(web5, did, data.members)
			}
		}

		if (!familyFound) {
			setFamilyFound(2)
			console.log("NO FAMILY FOUND. WAITING TO BE ADDED TO FAMILY")
			await checkIfAddedToFamily(web5, did, protocolDef)
		}

	}

	// step 3: if no, create a new family
	const createNewFamily = async (adminName) => {
		if (web5 && adminName) {
			await saveMyFamilyTree(web5, {
				familyName: adminName,
				members: [{
					id: did,
					name: adminName,
					isAdmin: 1
				}]
			})
			await checkIfFamily(web5, did, protocolDef)
		}
	}

	// step 4: request members to the family
	const requestFamilyAddition = async (familyID, memberName) => {
		const currentDate = new Date().toLocaleDateString();
		const currentTime = new Date().toLocaleTimeString();
		const { record } = await web5.dwn.records.write({
			data: {
				type: "request",
				id: did,
				name: memberName,
				request_date: `${currentDate} ${currentTime}`,
			},
			message: {
				protocol: protocolDef.protocol,
				protocolPath: "request",
				schema: protocolDef.types.request.schema,
				familyID: familyID
			}
		})
		// console.log("SENDING REQUEST FOR ADDITION TO FAMILY")
		await record.send(familyID)
		setFamilyRequested(true)
	}

	const checkForNewRequests = async (web5, did) => {
		if (web5) {
			const response = await web5.dwn.records.query({
				from: did,
				message: {
					filter: {
						protocol: protocolDefinition.protocol,
						schema: protocolDefinition.types.request.schema
					},
				},
			})

			let requests = []
			for (let i = 0; i < response.records.length; i++) {
				const data = await response.records[i].data.json()
				let addThisRequest = 1
				for (let j = 0; j < familyMembers.length; j++) {
					if (data.id == familyMembers[j].id) {
						addThisRequest = 0
					}
				}
				if (addThisRequest) {
					requests.push({
						_recordId: response.records[i]._recordId,
						id: data.id,
						name: data.name,
						request_date: data.request_date
					})
				}
			}
			// console.log(requests)
			setFamilyRequests(requests)
		}
	}

	// step 6: approve new member
	const viewRequests = async () => {
		setShowRequests(true)
	}

	const closeRequests = async () => {
		setShowRequests(false)
	}

	const addToFamily = async (id, name, recordID) => {

		let addEntry = 1
		for (let i = 0; i < familyMembers.length; i++) {
			if (familyMembers[i].id == id) {
				addEntry = 0
			}
		}

		if (addEntry) {

			// delete my existing family tree
			await deleteMyfamilyTree()

			const members = familyMembers
			members.push({
				id,
				name,
				isAdmin: 0
			})
			const record = await saveMyFamilyTree(web5, { familyName, members })

			// loop through all family members and send them the updated family tree
			for (let i = 0; i < members.length; i++) {
				if (members[i].id != did) {
					const { status } = await record.send(members[i].id)
					// console.log(status)
				}
			}

			await removeFromFamily(recordID)
			await fetchAllExpense(web5, did, familyMembers, id)
		}
	}

	const removeFromFamily = async (id) => {
		const response = await web5.dwn.records.delete({
			from: did,
			message: {
				recordId: id,
			},
		});
		console.log(response)
		return response.status.code
	}

	const saveMyFamilyTree = async (web5, data) => {
		if (web5 && protocolDef) {
			const { record } = await web5.dwn.records.write({
				data,
				message: {
					protocol: protocolDef.protocol,
					protocolPath: "family",
					schema: protocolDef.types.family.schema
				}
			})
			return record
		}
	}

	const deleteMyfamilyTree = async () => {
		if (web5 && protocolDef) {
			const response = await web5.dwn.records.query({
				message: {
					filter: {
						protocol: protocolDef.protocol,
						schema: protocolDef.types.family.schema
					},
				},
			})
			for (let i = 0; i < response.records.length; i++) {
				const recordId = response.records[i]._recordId
				const r = await web5.dwn.records.delete({
					message: {
						recordId: recordId,
					},
				});
			}
		}
	}

	const checkIfAddedToFamily = async (web5, myDid, protocolDefinition) => {
		if (web5 && myDid && protocolDefinition) {

			console.log("Checking for New family")

			const response = await web5.dwn.records.query({
				from: myDid,
				message: {
					filter: {
						protocol: protocolDefinition.protocol,
						schema: protocolDefinition.types.family.schema
					},
				},
			})

			if (response.records.length > 0) {
				const data = await response.records[0].data.json()
				const recordId = response.records[0]._recordId

				// delete my existing family tree
				console.log("DELETE FAMILY TREE")
				await deleteMyfamilyTree()

				// create new family tree
				console.log("CREATE NEW FAMILY TREE")
				await saveMyFamilyTree(web5, { familyName: data.familyName, members: data.members })

				// remove received family request
				console.log("REMOVE RECEIVED FAMILY REQUEST")
				await removeFromFamily(recordId)

				// refresh family check. this will refresh page and let the user enter the dashboard
				console.log("REFRESH FAMILY CHECK")
				await checkIfFamily(web5, myDid, protocolDefinition)
			}

		}
	}

	// step 5: create expenses
	const addNewExpense = async () => {
		setAddExpense(true)
	}

	const closeAddExpenseRequests = async () => {
		setAddExpense(false)
	}

	const saveNewExpense = async (date, expenseType, expenseDetails, amount) => {
		const uuid = uuidv4()
		const expense = {
			expenseDetails,
			date,
			writerID: did,
			amount,
			expenseType,
			uuid
		}
		const { record } = await web5.dwn.records.write({
			data: expense,
			message: {
				protocol: protocolDef.protocol,
				protocolPath: "expense",
				schema: protocolDef.types.expense.schema
			}
		})
		// loop through all family members and send them the expense
		for (let i = 0; i < familyMembers.length; i++) {
			if (familyMembers[i].id != did) {
				await record.send(familyMembers[i].id)
				console.log("SENT TO ", familyMembers[i].id)
			}
		}
		await fetchAllExpense(web5, did, familyMembers)
		closeAddExpenseRequests()
	}

	// step 7: fetch all expenses
	const fetchAllExpense = async (web5, did, familyMembers, newMemberDid = 0, allExpenses = []) => {
		if (web5 && protocolDef) {

			const expenses_received = await web5.dwn.records.query({
				from: did,
				message: {
					filter: {
						protocol: protocolDefinition.protocol,
						schema: protocolDefinition.types.expense.schema
					},
				},
			})

			if (expenses_received.records.length > 0) {
				console.log("EXPENSES RECEIVED: ", expenses_received.records.length)
			}
			for (let i = 0; i < expenses_received.records.length; i++) {
				const record = expenses_received.records[i]
				await removeFromFamily(record._recordId)

				const data = await record.data.json()
				console.log(data)
				let addThisExpense = 1
				console.log("ALL EXPENSES: ", allExpenses)
				for (let j = 0; j < allExpenses.length; j++) {
					if (allExpenses[j].uuid === data.uuid) {
						addThisExpense = 0
					}
				}
				if (addThisExpense) {
					await web5.dwn.records.write({
						data,
						message: {
							protocol: protocolDef.protocol,
							protocolPath: "expense",
							schema: protocolDef.types.expense.schema
						}
					})
				}
				else {
					console.log("EXPENSE ALREADY ADDED")
				}
			}

			const expenses_sent = await web5.dwn.records.query({
				message: {
					filter: {
						protocol: protocolDefinition.protocol,
						schema: protocolDefinition.types.expense.schema
					},
				},
			})

			if (expenses_sent.records.length != allExpenses.length) {
				console.log("EXPENSES SENT: ", expenses_sent.records.length)
				console.log("ALL EXPENSES: ", allExpenses.length)
			}

			if (expenses_sent.records.length != allExpenses.length) {
				let expenses_sent_dataArr = [], expenses_uuidArr = []
				for (let i = 0; i < expenses_sent.records.length; i++) {
					const record = expenses_sent.records[i]
					const data = await record.data.json()
					// add only if uuid not in expenses_uuidArr
					if (!expenses_uuidArr.includes(data.uuid)) {
						expenses_uuidArr.push(data.uuid)
						expenses_sent_dataArr.push(data)
						if (newMemberDid) {
							await record.send(newMemberDid)
						}
					}
				}
				expenses_sent_dataArr.sort((a, b) => new Date(b.date) - new Date(a.date));

				// loop expenses_sent_dataArr and add writer name from familyMembers by matching id
				for (let i = 0; i < expenses_sent_dataArr.length; i++) {
					for (let j = 0; j < familyMembers.length; j++) {
						if (expenses_sent_dataArr[i].writerID == familyMembers[j].id) {
							expenses_sent_dataArr[i].writerName = familyMembers[j].name
						}
					}
				}

				setAllExpenses(expenses_sent_dataArr)
			}
			else {
				console.log("NO NEW EXPENSES")
			}

		}
	}

	if (!isFamily) {
		return (
			<div>Loading...</div>
		)
	}
	if (isFamily == 2) {
		return (
			<FamilyForm removeAllMessages={removeAllMessages} familyRequested={familyRequested} onNewFamilySubmit={createNewFamily} onJoinFamilySubmit={requestFamilyAddition} />
		)
	}
	if (isFamily == 1) {
		if (showRequests) {
			return (
				<ShowRequests familyMembers={familyMembers} addToFamily={addToFamily} removeFromFamily={removeFromFamily} closeRequests={closeRequests} familyRequests={familyRequests} />
			)
		}
		else {
			if (addExpense) {
				return (
					<AddExpense closeRequests={closeAddExpenseRequests} saveNewExpense={saveNewExpense} />
				)
			}
			else {
				return (
					<ViewExpenses removeAllMessages={removeAllMessages} familyRequests={familyRequests} familyName={familyName} familyMembers={familyMembers} myDid={did} onViewRequestsSubmit={viewRequests} onAddExpenseSubmit={addNewExpense} allExpenses={allExpenses} />
				)
			}
		}
	}
}