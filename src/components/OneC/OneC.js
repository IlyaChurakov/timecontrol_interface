import { React, useState, useEffect } from "react"
import "./oneC.css"
import Loader from "../Loader/Loader"
import { URL } from "../../variables"

const OneC = () => {
	const [data, setData] = useState(null)

	const getData = async () => {
		await fetch(`http://${URL}/onec/today`, {
			method: "GET",
		})
			.then(res => {
				return res.json()
			})
			.then(resBody => {
				console.log(resBody)
				setData(resBody)
			})
			.catch(err => {
				console.log(err)
			})
	}

	const getDossiers = async () => {
		await fetch("http://172.16.3.98/users/", {
			method: "GET",
			headers: {
				authorization:
					"Token 5aecaaa12387ecfe996d97fc450b8a17c1453736db60ba6599c813dc3ca4ba8d",
			},
		})
			.then(res => {
				return res.json()
			})
			.then(resBody => {
				console.log(resBody)
				setData(resBody)
			})
			.catch(err => {
				console.log(err)
			})
	}

	useEffect(() => {
		getData()
		getDossiers()
	}, [])

	return (
		<div className='wrapper'>
			<div className='btnWrapper'>
				<h2 className='btnTitle'>Данные с 1С:ЗУП</h2>
				<button onClick={getData}>Обновить</button>
			</div>
			{data ? (
				<div className='onec'>
					<div className='onec_header'>
						<div className='column_name'>Имя</div>
						<div className='column_surname'>Фамилия</div>
						<div className='column_vacations'>Даты отпусков</div>
						<div className='column_sick'>Даты больничных</div>
					</div>
					<div className='onec_body'>
						{data.map((item, num) => {
							return (
								<div key={num} className='onec_limb'>
									<div className='column_name'>{item.name}</div>
									<div className='column_surname'>{item.surname}</div>
									<div>
										{item.vacation_dates.map((it, n) => {
											return (
												<div
													className='column_vacations'
													key={n}
												>{`${it.start} - ${it.end}`}</div>
											)
										})}
									</div>
									<div>
										{item.sick_dates.map((it, n) => {
											return (
												<div
													className='column_sick'
													key={n}
												>{`${it.start} - ${it.end}`}</div>
											)
										})}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			) : (
				<Loader />
			)}
		</div>
	)
}

export default OneC
