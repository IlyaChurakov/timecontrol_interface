import { useEffect, useRef, useState } from 'react'
import { URL } from '../../variables'
import './cameras.css'

const Cameras = () => {
	const [data, setData] = useState([])
	const [hintArr, setHintArr] = useState(null)
	// const hintArr = ["512", "513", "514"]
	const [startData, setStartData] = useState(null)
	const [reportData, setReportData] = useState(true)
	const [commonWorkTime, setCommonWorkTime] = useState(null)
	const [allProebTime, setAllProebTime] = useState(0)
	const [lateTime, setLateTime] = useState(0)

	const lineTop = useRef()
	const lineMiddle = useRef()
	const lineBottom = useRef()

	const reportFIO = useRef()
	const reportZone = useRef()
	const reportDate = useRef()

	const getZones = () => {
		console.log('zones')
		fetch(`http://localhost:8080/zones`)
			.then(response => {
				return response.json()
			})
			.then(resBody => {
				setHintArr(resBody)
				console.log(resBody)
			})
			.catch(err => console.log('Данных пока нет'))
	}

	const getData = () => {
		fetch(`http://localhost:8080/cameras/20`)
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
			.catch(err => console.log('Данных пока нет'))
	}

	const [toggleFilterDate, setToggleFilterDate] = useState('forward')

	const filterData = arr => {
		function byField(field) {
			if (toggleFilterDate == 'forward') {
				lineTop.current.style.width = '10px'
				lineBottom.current.style.width = '20px'
				return (a, b) => (a[field] > b[field] ? 1 : -1)
			} else if (toggleFilterDate == 'reverse') {
				lineTop.current.style.width = '20px'
				lineBottom.current.style.width = '10px'
				return (a, b) => (a[field] > b[field] ? -1 : 1)
			}
		}

		let filtered = [...arr]
		filtered.sort(byField('date'))
		setData(filtered)

		if (toggleFilterDate == 'reverse') {
			setToggleFilterDate('forward')
		} else if (toggleFilterDate == 'forward') {
			setToggleFilterDate('reverse')
		}
	}
	const filterReportData = arr => {
		if (arr.length) {
			function byField(field) {
				return (a, b) => (a[field] > b[field] ? 1 : -1)
			}

			let filtered = [...arr]
			filtered.sort(byField('date'))

			const transformDateToWorkTime = (arr, start, finish) => {
				let startWork = arr[start].date
				let finishWork = arr[finish].date

				let startYMD = startWork.split('T')[0].replace(/\-/g, '.')
				let startHMS = startWork.split('T')[1].split('.0')[0]
				let finishYMD = finishWork.split('T')[0].replace(/\-/g, '.')
				let finishHMS = finishWork.split('T')[1].split('.0')[0]

				let startTime = new Date(`${startYMD} ${startHMS}`)
				let finishTime = new Date(`${finishYMD} ${finishHMS}`)
				let workTime = finishTime - startTime

				return workTime
			}

			const transformDateToHMS = start => {
				let startYMD = filtered[start].date.split('T')[0].replace(/\-/g, '.')
				let startHMS = filtered[start].date.split('T')[1].split('.0')[0]
				let hours = startHMS.split(':')[0]
				let minutes = startHMS.split(':')[1].split(':')[0]
				let seconds = startHMS.split(':')[1]
				return {
					startYMD,
					startHMS,
					hours: +hours,
					minutes: +minutes,
					seconds: +seconds,
				}
			}

			setCommonWorkTime(
				() =>
					transformDateToWorkTime(filtered, 0, filtered.length - 1) /
					(1000 * 60)
			)

			for (let i = 0; i < filtered.length; i++) {
				// if (
				// 	filtered[i].eventType == "Вход" ||
				// 	filtered[i].eventType == "Вход по лицу"
				// ) {
				if (transformDateToHMS(i).hours >= 6) {
					setLateTime(
						new Date(
							`${transformDateToHMS(i).startYMD} ${
								transformDateToHMS(i).startHMS
							}`
						) - new Date(`${transformDateToHMS(i).startYMD} 09:00:00`)
					)
					break
				}
				// }
			}

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

			let localAllProebTime = 0

			filtered.forEach((record, num) => {
				if (filtered[num + 1]) {
					let proebTime = transformDateToWorkTime(filtered, num, num + 1)
					localAllProebTime += proebTime
					setAllProebTime(localAllProebTime)
					return localAllProebTime
				}
			})

			setReportData(filtered)
		} else {
			setReportData(false)
			console.log('ничего не нашлось')
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

			await fetch(`http://${URL}/camfilter`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json;charset=utf-8',
				},
				body: JSON.stringify({ value: findingWord }),
			})
				.then(response => console.log('Запрос прошел успешно'))
				.catch(err => console.log(err))

			await fetch(`http://${URL}/camfilter`)
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

		const date = reportDate.current.value
		const fio = reportFIO.current.value
		const zone = reportZone.current.value

		if (date && fio && zone) {
			await fetch(
				`http://localhost:8080/cameras/fio/zone/${fio}/${zone}/${date}`
			)
				.then(response => {
					return response.json()
				})
				.then(resBody => {
					setData(resBody)
				})
				.catch(err => console.log(err))
		} else if (date && fio) {
			await fetch(`http://localhost:8080/cameras/fio/${fio}/${date}`)
				.then(response => {
					return response.json()
				})
				.then(resBody => {
					setData(resBody)
				})
				.catch(err => console.log(err))
		} else if (date) {
			await fetch(`http://localhost:8080/cameras/${date}`)
				.then(response => {
					return response.json()
				})
				.then(resBody => {
					setData(resBody)
				})
				.catch(err => console.log(err))
		} else {
			alert('Введите данные')
		}
	}

	// useEffect(() => {
	// 	const res = data.reduce((o, i) => {
	// 		if (!o.find(v => v.fio == i.fio && v.id_camera == i.id_camera)) {
	// 			o.push(i)
	// 		}
	// 		return o
	// 	}, [])
	// 	console.log(res, "gfgfgfg")
	// }, [data])

	useEffect(() => {
		getZones()
		getData()
	}, [])

	return (
		<div className='table_wrapper'>
			<div className='firstColumn'>
				<h2>Данные с камер</h2>
				<form className='report'>
					<input ref={reportFIO} type='search' placeholder='ФИО' />
					<select ref={reportZone} name='' id=''>
						<option value='' selected>
							Зона не выбрана
						</option>
						{hintArr ? (
							hintArr.map((item, num) => {
								return <option key={num}>{item.name}</option>
							})
						) : (
							<option>Где то профукали зоны</option>
						)}
					</select>
					<input ref={reportDate} type='date' />
					<button onClick={e => makeReport(e)}>Найти</button>
				</form>
			</div>

			<div className='table secondColumn'>
				<div className='filter'>
					<form>
						<input
							type='search'
							placeholder='Поиск по ФИО'
							onInput={e => findName(e)}
						/>
						<ul className='inputHint'>
							{/* {data.map((item, num) => {
								return (
									<li key={num}>
										<td>{item !== undefined ? item.name : null}</td>
										<td>{item !== undefined ? item.fio : null}</td>
										<td>{item !== undefined ? item.id_camera : null}</td>
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
									<td>ФИО</td>
									<td>Зона</td>
									<td>Камера</td>
									<td>Время</td>
									<td>Дата</td>
								</tr>
								{data.map((item, num) => {
									return (
										<tr key={num}>
											<td>{item !== undefined ? item.fio : null}</td>
											<td>{item !== undefined ? item.name : null}</td>
											<td>{item !== undefined ? item.id_camera : null}</td>
											<td>
												{item !== undefined
													? String(new Date(item.event_dt))
															.split(/\s\d\d\d\d\s/)[1]
															.split('GMT')[0]
													: null}
											</td>
											{console.log(data)}
											<td>
												{item !== undefined
													? item.event_dt.split('T')[0]
													: null}
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

export default Cameras
