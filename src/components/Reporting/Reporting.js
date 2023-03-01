import { React, useState, useRef, useEffect } from "react"
import "./reporting.css"
import { URL } from "../../variables"

const Reporting = () => {
	const [data, setData] = useState(null)
	const [startData, setStartData] = useState(null)
	const [reportData, setReportData] = useState([])
	const [commonWorkTime, setCommonWorkTime] = useState(0) // было null
	const [workTime, setWorkTime] = useState(0)
	const [lateTime, setLateTime] = useState(0)

	const reportDate = useRef()

	// const eventsOfAllEmp = []
	// const watchListOfEmployees = []

	useEffect(() => {
		console.log(reportData)
	}, [reportData])

	const filterReportData = arr => {
		const time = {
			name: arr.length ? arr[0].name : null,
			latetime: null,
			worktime: null,
			commonworktime: null,
		}

		// let eventsOfAllEmp = []

		if (arr.length) {
			console.log(arr[0].name)
			const byField = field => {
				return (a, b) => (a[field] > b[field] ? 1 : -1)
			}

			let filtered = [...arr]
			filtered.sort(byField("date"))

			const transformDateToWorkTime = (arr, start, finish) => {
				let startWork = arr[start].date
				let finishWork = arr[finish].date

				let startYMD = startWork.split("T")[0].replace(/\-/g, ".")
				let startHMS = startWork.split("T")[1].split(".0")[0]
				let finishYMD = finishWork.split("T")[0].replace(/\-/g, ".")
				let finishHMS = finishWork.split("T")[1].split(".0")[0]

				let startTime = new Date(`${startYMD} ${startHMS}`)
				let finishTime = new Date(`${finishYMD} ${finishHMS}`)
				let workTime = finishTime - startTime

				return workTime
			}

			const transformDateToHMS = start => {
				let startYMD = filtered[start].date.split("T")[0].replace(/\-/g, ".")
				let startHMS = filtered[start].date.split("T")[1].split(".0")[0]
				let hours = startHMS.split(":")[0]
				let minutes = startHMS.split(":")[1].split(":")[0]
				let seconds = startHMS.split(":")[1]
				return {
					startYMD,
					startHMS,
					hours: +hours,
					minutes: +minutes,
					seconds: +seconds,
				}
			}

			const firstAndLastEventsInOut = {
				inTime: null,
				outTime: null,
			}

			const findIn = () => {
				for (let i = 0; i < filtered.length - 1; i++) {
					if (
						(filtered[i].eventType == "Вход" ||
							filtered[i].eventType == "Вход по лицу") &&
						(filtered[i + 1].eventType == "Выход" ||
							filtered[i + 1].eventType == "Выход по лицу")
					) {
						firstAndLastEventsInOut.inTime = i
						time.latetime =
							new Date(
								`${
									transformDateToHMS(firstAndLastEventsInOut.inTime).startYMD
								} ${
									transformDateToHMS(firstAndLastEventsInOut.inTime).startHMS
								}`
							) -
							new Date(
								`${
									transformDateToHMS(firstAndLastEventsInOut.inTime).startYMD
								} 09:00:00`
							)
						console.log(time.latetime)
						break
					}
				} // Поиск первого входа
			}

			const findOut = () => {
				const reverseFiltered = [...filtered].reverse()

				for (let i = 0; i < reverseFiltered.length - 1; i++) {
					if (
						reverseFiltered[i].eventType == "Выход" ||
						reverseFiltered[i].eventType == "Выход по лицу"
					) {
						firstAndLastEventsInOut.outTime = reverseFiltered.length - 1 - i

						time.commonworktime =
							transformDateToWorkTime(
								filtered,
								firstAndLastEventsInOut.inTime,
								firstAndLastEventsInOut.outTime
							) /
							(1000 * 60)
						console.log(time.commonworktime)
						break
					}
				} // Поиск последнего выхода
			}

			findIn()
			findOut()

			const timeObj = {
				worktime: 0,
			}

			filtered.forEach((event, num) => {
				if (
					filtered[num].eventType == "Вход" ||
					filtered[num].eventType == "Вход по лицу"
				) {
					if (
						filtered[num + 1] &&
						(filtered[num + 1].eventType == "Выход" ||
							filtered[num + 1].eventType == "Выход по лицу")
					) {
						time.worktime =
							time.worktime + transformDateToWorkTime(filtered, num, num + 1)

						num++
					} else {
						num++
					}
				} else {
					num++
				}
				console.log(timeObj.worktime)
			})

			// console.log

			setReportData(reportData => [...reportData, time])
		}
	}

	// const startFilterReportData = async () => {
	// 	for (const item of watchListOfEmployees) {
	// 		await filterReportData(item)
	// 		console.log("gdfghdfgh")
	// 		// await blablabla(item)
	// 	}
	// }

	const makeReport = async empName => {
		let watchListOfEmployees = []
		if (reportDate.current.value) {
			// await fetch(`http://${URL}/allempskud`, {
			// 	method: "POST",
			// 	headers: {
			// 		"Content-Type": "application/json;charset=utf-8",
			// 	},
			// 	body: JSON.stringify({
			// 		name: empName,
			// 		date: reportDate.current.value,
			// 	}),
			// })
			// 	.then(response => console.log(response))
			// 	.catch(err => {})

			await fetch(
				`http://${URL}/allempskud?date=${reportDate.current.value}&name=${empName}`
			)
				.then(response => {
					return response.json()
				})
				.then(resBody => {
					console.log(resBody)
					watchListOfEmployees = resBody
				})
				.then(() => {
					console.log(watchListOfEmployees)
					// startFilterReportData() // Тут должен быть вызов функции filterReportData()
					// for (const item of watchListOfEmployees) {
					filterReportData(watchListOfEmployees)
					console.log(watchListOfEmployees)
					// }
				})
				.catch(err => {})
		} else {
			alert("Данные не введены")
		}
	}

	const listOfEmployees = {
		employees: [],
	}

	const everyEmployee = async e => {
		e.preventDefault()
		listOfEmployees.employees.length = 0
		setReportData([])

		await fetch(`http://${URL}/employees`)
			.then(response => {
				return response.json()
			})
			.then(resBody => {
				listOfEmployees.employees = resBody
				// listOfEmployees.employees = [
				// 	{
				// 		name: "Чураков Илья Михайлович",
				// 	},
				// 	{
				// 		name: "Придорожный Алексей Николаевич",
				// 	},
				// ]
			})
			.catch(err => {})
		// listOfEmployees.employees = [
		// 	{
		// 		name: "Чураков Илья Михайлович",
		// 	},
		// 	{
		// 		name: "Придорожный Алексей Николаевич",
		// 	},
		// ]
		if (listOfEmployees.employees.length) {
			for (const item of listOfEmployees.employees) {
				await makeReport(item.name)
			}
		}

		console.log(reportData)
	}

	return (
		<div className='table_wrapper'>
			<div className='firstColumn'>
				<h2>Данные из СКУД</h2>
				<form className='report'>
					<input type='date' ref={reportDate} />
					<button onClick={e => everyEmployee(e)}>Составить отчет</button>
				</form>
			</div>

			<div className='table secondColumn'>
				<div className='filter'>
					<form>
						<input type='search' placeholder='Поиск по ФИО в базе' />
					</form>
				</div>
				<table border='1' cellSpacing='1' cellPadding='1'>
					{reportData ? (
						reportData.length ? (
							<tbody>
								<tr>
									<td>ФИО сотрудника</td>
									<td>Опоздание</td>
									<td>Пришел раньше</td>
									<td>Присутствовал</td>
									<td>Отсутствовал</td>
									<td>Всего</td>
								</tr>
								{reportData.map((item, num) => {
									console.log(reportData)
									return (
										<tr key={num}>
											<td>{item ? item.name : null}</td>
											<td>
												{item !== undefined
													? item.latetime > 0
														? ` ${
																(item.latetime / (1000 * 60) -
																	((item.latetime / (1000 * 60)) % 60)) /
																60
														  } ч. ${Math.floor(
																(item.latetime / (1000 * 60)) % 60
														  )} мин.`
														: ` ${
																((item.latetime * -1) / (1000 * 60) -
																	(((item.latetime * -1) / (1000 * 60)) % 60)) /
																60
														  } ч. ${Math.floor(
																((item.latetime * -1) / (1000 * 60)) % 60
														  )} мин.`
													: "пусто"}
											</td>
											<td>...</td>
											<td>
												{item !== undefined
													? ` ${
															(item.worktime / (1000 * 60) -
																((item.worktime / (1000 * 60)) % 60)) /
															60
													  } ч. ${Math.floor(
															(item.worktime / (1000 * 60)) % 60
													  )} мин.`
													: "пусто"}
											</td>
											<td>...</td>
											<td>
												{item !== undefined
													? ` ${
															(item.commonworktime -
																(item.commonworktime % 60)) /
															60
													  } ч. ${Math.floor(item.commonworktime % 60)} мин.`
													: "пусто"}
											</td>
										</tr>
									)
								})}
							</tbody>
						) : (
							<tbody>
								<tr>
									<td>Совпадений не найдено</td>
								</tr>
							</tbody>
						)
					) : (
						<tbody>
							<tr>
								<td>За последнюю минуту событий нет</td>
							</tr>
						</tbody>
					)}
				</table>
			</div>
		</div>
	)
}

export default Reporting
