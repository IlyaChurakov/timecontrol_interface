import { useEffect, useRef, useState } from 'react'
import { URL } from '../../variables'
import './table.css'

const Table = () => {
	const [data, setData] = useState(null)
	const [testData, setTestData] = useState([])
	const [firstLoadData, setFirstLoadData] = useState(null)
	const [reportData, setReportData] = useState(null)

	// const lineTop = useRef()
	// const lineMiddle = useRef()
	// const lineBottom = useRef()

	const reportFIO = useRef()
	const reportDate = useRef()

	const test = () => {
		fetch('http://localhost:8080/door/50')
			.then(response => {
				return response.json()
			})
			.then(resBody => {
				setTestData(resBody)
			})
	}

	// const [toggleFilterDate, setToggleFilterDate] = useState('forward')

	// const filterData = arr => {
	// 	function byField(field) {
	// 		if (toggleFilterDate == 'forward') {
	// 			lineTop.current.style.width = '10px'
	// 			lineBottom.current.style.width = '20px'
	// 			return (a, b) => (a[field] > b[field] ? 1 : -1)
	// 		} else if (toggleFilterDate == 'reverse') {
	// 			lineTop.current.style.width = '20px'
	// 			lineBottom.current.style.width = '10px'
	// 			return (a, b) => (a[field] > b[field] ? -1 : 1)
	// 		}
	// 	}

	// 	let filtered = [...arr]
	// 	filtered.sort(byField('date'))
	// 	setData(filtered)

	// 	if (toggleFilterDate == 'reverse') {
	// 		setToggleFilterDate('forward')
	// 	} else if (toggleFilterDate == 'forward') {
	// 		setToggleFilterDate('reverse')
	// 	}
	// }

	const findName = async e => {
		e.preventDefault()
		if (e.target.value) {
			let findingWord = e.target.value

			await fetch(`http://${URL}/filter`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json;charset=utf-8',
				},
				body: JSON.stringify({ value: findingWord }),
			})
				.then(response => console.log('Запрос прошел успешно'))
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
			setData(firstLoadData)
		}
	}

	const makeReport = async e => {
		e.preventDefault()

		const date = reportDate.current.value
		const fio = reportFIO.current.value

		console.log(fio)

		if (date && fio) {
			await fetch(`http://localhost:8080/report/${fio}/${date}`)
				.then(response => {
					return response.json()
				})
				.then(resBody => {
					setTestData(resBody.rows)
					setReportData({
						commonWorkTime: resBody.commonWorkTime,
						workTime: resBody.workTime,
						lateTime: resBody.lateTime,
					})
					console.log(resBody)
				})
				.catch(err => console.log(err))
		} else {
			alert('Введите данные')
		}
	}

	// testReport()

	useEffect(() => {
		// getData()
		test()
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
							{reportData ? reportData.commonWorkTime : null}
						</div>
						<div className='reportTime'>
							Присутствовал
							{reportData ? reportData.workTime : null}
						</div>
						<div className='reportTime'>
							Отсутствовал
							{/* {` ${Math.floor(
								(commonWorkTime * 1000 * 60 - workTime) / (1000 * 60)
							)}`} */}
							мин.
						</div>
						<div className='reportTime'>
							{reportData.lateTime ? (
								reportData.lateTime > 0 ? (
									<div>
										Опоздание на:
										{reportData.lateTime}
									</div>
								) : (
									<div>
										Пришел раньше на:
										{reportData.lateTime}
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
						{/* <input
							type='search'
							placeholder='Поиск по ФИО в базе'
							onInput={e => findName(e)}
						/> */}
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
					{/* <button onClick={() => filterData(data)}>
						<div className='sort_icon'>
							<div className='line line-top' ref={lineTop}></div>
							<div className='line line-middle' ref={lineMiddle}></div>
							<div className='line line-bottom' ref={lineBottom}></div>
						</div>
						<div className='sort_icon-text'>Сортировать</div>
					</button> */}
				</div>
				<table border='1' cellSpacing='1' cellPadding='1'>
					{testData ? (
						testData.length ? (
							<tbody>
								<tr>
									<td>ID записи</td>
									<td>ФИО сотрудника</td>
									<td>Двери</td>
									<td>Тип события</td>
									<td>Время</td>
									<td>Дата</td>
								</tr>
								{testData.map((item, num) => {
									return (
										<tr key={num}>
											<td>{item !== undefined ? item.id : null}</td>
											<td>{item !== undefined ? item.name : null}</td>
											<td>{item !== undefined ? item.driver_name : null}</td>
											<td>{item !== undefined ? item.eventType : null}</td>
											<td>
												{item !== undefined
													? item.date.split('T')[1].split('.0')[0]
													: null}
											</td>
											<td>
												{item !== undefined ? item.date.split('T')[0] : null}
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
