import { useState, useEffect, useRef } from "react"
import "./table.css"
import { URL } from "../../variables"

const Table = () => {
	const [data, setData] = useState(null)
	const [hintArr, setHintArr] = useState(null)
	const [startData, setStartData] = useState(null)
	const [reportData, setReportData] = useState(true)
	const [commonWorkTime, setCommonWorkTime] = useState(0) // было null
	const [workTime, setWorkTime] = useState(0)
	const [allProebTime, setAllProebTime] = useState(0)
	const [lateTime, setLateTime] = useState(0)

	const lineTop = useRef()
	const lineMiddle = useRef()
	const lineBottom = useRef()

	const reportFIO = useRef()
	const reportDate = useRef()

	const getData = () => {
		fetch(`http://${URL}/database`)
			.then(response => {
				return response.json()
			})
			.then(resBody => {
				resBody.forEach(item => {
					item.id = +item.id
				})
				setData(resBody)
				setStartData(resBody) // хранит данные которые мы получили в первый раз, после использования поиска по слову, отсюда заберем изначальный результат
				console.log(resBody)
			})
			.catch(err => console.log("Данных пока нет"))
	}

	const [toggleFilterDate, setToggleFilterDate] = useState("forward")

	const filterData = arr => {
		function byField(field) {
			if (toggleFilterDate == "forward") {
				lineTop.current.style.width = "10px"
				lineBottom.current.style.width = "20px"
				return (a, b) => (a[field] > b[field] ? 1 : -1)
			} else if (toggleFilterDate == "reverse") {
				lineTop.current.style.width = "20px"
				lineBottom.current.style.width = "10px"
				return (a, b) => (a[field] > b[field] ? -1 : 1)
			}
		}

		let filtered = [...arr]
		filtered.sort(byField("date"))
		setData(filtered)

		if (toggleFilterDate == "reverse") {
			setToggleFilterDate("forward")
		} else if (toggleFilterDate == "forward") {
			setToggleFilterDate("reverse")
		}
	}

	const filterReportData = arr => {
		console.log(arr)
		if (arr.length) {
			function byField(field) {
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

			for (let i = 0; i < filtered.length - 1; i++) {
				if (
					filtered[i].eventType == "Вход" ||
					(filtered[i].eventType == "Вход по лицу" &&
						filtered[i + 1].eventType == "Выход") ||
					filtered[i + 1].eventType == "Выход по лицу"
				) {
					firstAndLastEventsInOut.inTime = i
					break
				}
			}

			const reverseFiltered = [...filtered].reverse()

			for (let i = 0; i < reverseFiltered.length - 1; i++) {
				if (
					reverseFiltered[i].eventType == "Выход" ||
					reverseFiltered[i].eventType == "Выход по лицу"
				) {
					firstAndLastEventsInOut.outTime = reverseFiltered.length - 1 - i
					break
				}
			}

			setLateTime(
				new Date(
					`${transformDateToHMS(firstAndLastEventsInOut.inTime).startYMD} ${
						transformDateToHMS(firstAndLastEventsInOut.inTime).startHMS
					}`
				) -
					new Date(
						`${
							transformDateToHMS(firstAndLastEventsInOut.inTime).startYMD
						} 09:00:00`
					)
			)

			setCommonWorkTime(
				() =>
					transformDateToWorkTime(
						filtered,
						firstAndLastEventsInOut.inTime,
						firstAndLastEventsInOut.outTime
					) /
					(1000 * 60)
			)

			// for (let i = 0; i < filtered.length; i++) {
			// 	if (
			// 		filtered[i].eventType == "Вход" ||
			// 		filtered[i].eventType == "Вход по лицу"
			// 	) {
			// 		if (transformDateToHMS(i).hours >= 6) {
			// 			setLateTime(
			// 				new Date(
			// 					`${transformDateToHMS(i).startYMD} ${
			// 						transformDateToHMS(i).startHMS
			// 					}`
			// 				) - new Date(`${transformDateToHMS(i).startYMD} 09:00:00`)
			// 			)
			// 			break
			// 		}
			// 	}
			// }

			// filtered.forEach((item, num) => {
			// 	console.log(num, "num")
			// 	if (item.eventType == "Вход" || item.eventType == "Вход по лицу") {
			// 		if (transformDateToHMS(num).hours >= 6) {
			// 			console.log("бабах")
			// 			setLateTime(
			// 				new Date(
			// 					`${transformDateToHMS(num).startYMD} ${
			// 						transformDateToHMS(num).startHMS
			// 					}`
			// 				) - new Date(`${transformDateToHMS(num).startYMD} 06:00:00`)
			// 			)
			// 		}
			// 	}
			// })

			const timeObj = {
				worktime: 0,
			}

			filtered.forEach((event, num) => {
				if (
					filtered[num].eventType &&
					(filtered[num].eventType == "Вход" ||
						filtered[num].eventType == "Вход по лицу")
				) {
					if (
						filtered[num + 1] &&
						(filtered[num + 1].eventType == "Выход" ||
							filtered[num + 1].eventType == "Выход по лицу")
					) {
						timeObj.worktime =
							timeObj.worktime + transformDateToWorkTime(filtered, num, num + 1)
						num++
					} else {
						num++
					}
				} else {
					num++
				}
			})
			setWorkTime(timeObj.worktime)
			setReportData(filtered)
		} else {
			setReportData(false)
		}
	}

	// const transformStr = string => {
	// 	let str = string
	// 	const arr = []
	// 	let transformedStr = ""
	// 	for (let i = 0; i < str.length; i++) {
	// 		arr.push(str[i])
	// 	}

	// 	arr.forEach((item, num) => {
	// 		arr[0] = arr[0].toUpperCase()
	// 		if (arr[num] == " ") {
	// 			if (arr[num + 1]) {
	// 				arr[num + 1] = arr[num + 1].toUpperCase()
	// 			}
	// 		}
	// 		transformedStr = transformedStr + arr[num]
	// 	})

	// 	return transformedStr
	// }

	const findName = async e => {
		e.preventDefault()
		if (e.target.value) {
			let findingWord = e.target.value

			await fetch(`http://${URL}/filter`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json;charset=utf-8",
				},
				body: JSON.stringify({ value: findingWord }),
			})
				.then(response => console.log("Запрос прошел успешно"))
				.catch(err => console.log(err))

			await fetch(`http://${URL}/filter`)
				.then(response => {
					return response.json()
				})
				.then(resBody => {
					setData(resBody)
				})
				.catch(err => console.log(err))
		} else {
			setData(startData)
		}
	}

	const makeReport = async e => {
		e.preventDefault()

		if (reportFIO.current.value && reportDate.current.value) {
			await fetch(`http://${URL}/report`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json;charset=utf-8",
				},
				body: JSON.stringify({
					fio: reportFIO.current.value,
					date: reportDate.current.value,
				}),
			})
				.then(response => console.log(response))
				.catch(err => console.log(err))
			await fetch(`http://${URL}/report`)
				.then(response => {
					return response.json()
				})
				.then(resBody => {
					setReportData(resBody)
					console.log(resBody)
					filterReportData(resBody)
					filterData(resBody)
				})
				.catch(err => console.log(err))
		} else {
			console.log("Данные не введены")
			alert("Данные не введены")
		}
	}

	useEffect(() => {
		getData()
	}, [])

	return (
		<div className='table_wrapper'>
			<div className='firstColumn'>
				<h2>Данные из СКУД</h2>
				<form className='reportSKUD'>
					<input ref={reportFIO} type='search' placeholder='ФИО' />
					<input ref={reportDate} type='date' />
					<button onClick={e => makeReport(e)}>Составить отчет</button>
				</form>
				{reportData ? (
					<div>
						<div className='reportTime'>
							Всего на работе
							{` ${
								(commonWorkTime - (commonWorkTime % 60)) / 60
							} ч. ${Math.floor(commonWorkTime % 60)} мин.`}
						</div>
						<div className='reportTime'>
							Присутствовал
							{` ${
								(workTime / (1000 * 60) - ((workTime / (1000 * 60)) % 60)) / 60
							} ч. ${Math.floor((workTime / (1000 * 60)) % 60)} мин.`}
						</div>
						<div className='reportTime'>
							Отсутствовал
							{` ${Math.floor(
								(commonWorkTime * 1000 * 60 - workTime) / (1000 * 60)
							)}`}
							мин.
						</div>
						<div className='reportTime'>
							{lateTime ? (
								lateTime > 0 ? (
									<div>
										Опоздание на:
										{` ${
											(lateTime / (1000 * 60) -
												((lateTime / (1000 * 60)) % 60)) /
											60
										} ч. ${Math.floor((lateTime / (1000 * 60)) % 60)} мин.`}
									</div>
								) : (
									<div>
										Пришел раньше на:
										{` ${
											((lateTime * -1) / (1000 * 60) -
												(((lateTime * -1) / (1000 * 60)) % 60)) /
											60
										} ч. ${Math.floor(
											((lateTime * -1) / (1000 * 60)) % 60
										)} мин.`}
									</div>
								)
							) : null}
						</div>
					</div>
				) : (
					<div className='reportTime'>Совпадений не найдено</div>
				)}
			</div>

			<div className='table secondColumn'>
				<div className='filter'>
					<form>
						<input
							type='search'
							placeholder='Поиск по ФИО в базе'
							onInput={e => findName(e)}
						/>
						<ul className='inputHint'>
							{/* {data.map((item, num) => {
								return (
									<li key={num}>
										<td>{item !== undefined ? item.id : null}</td>
										<td>{item !== undefined ? item.name : null}</td>
										<td>{item !== undefined ? item.driver_name : null}</td>
										<td>{item !== undefined ? item.eventType : null}</td>
										<td>
											{item !== undefined
												? item.date.split("T")[1].split(".0")[0]
												: null}
										</td>
										<td>
											{item !== undefined ? item.date.split("T")[0] : null}
										</td>
									</li>
								)
							})} */}
						</ul>
					</form>
					<button onClick={() => filterData(data)}>
						<div className='sort_icon'>
							<div className='line line-top' ref={lineTop}></div>
							<div className='line line-middle' ref={lineMiddle}></div>
							<div className='line line-bottom' ref={lineBottom}></div>
						</div>
						<div className='sort_icon-text'>Сортировать</div>
					</button>
				</div>
				<table border='1' cellSpacing='1' cellPadding='1'>
					{data ? (
						data.length ? (
							<tbody>
								<tr>
									<td>ID записи</td>
									<td>ФИО сотрудника</td>
									<td>Двери</td>
									<td>Тип события</td>
									<td>Время</td>
									<td>Дата</td>
								</tr>
								{data.map((item, num) => {
									return (
										<tr key={num}>
											<td>{item !== undefined ? item.id : null}</td>
											<td>{item !== undefined ? item.name : null}</td>
											<td>{item !== undefined ? item.driver_name : null}</td>
											<td>{item !== undefined ? item.eventType : null}</td>
											<td>
												{item !== undefined
													? item.date.split("T")[1].split(".0")[0]
													: null}
											</td>
											<td>
												{item !== undefined ? item.date.split("T")[0] : null}
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

export default Table
