import { React, useEffect, useState } from "react"
import "./dataViewer.css"
import CameraEvent from "../CameraEvent/CameraEvent"
import Info from "./../Info/Info"
import Loader from "../Loader/Loader"
import { URL } from "../../variables"

const DataViewer = () => {
	const [data, setData] = useState(null)
	const [visible, setVisible] = useState("info hide")

	let features = []

	const getData = () => {
		fetch(`http://${URL}/hook`, {
			method: "GET",
		})
			.then(response => {
				return response.json()
			})
			.then(resBody => {
				resBody.forEach(item => {
					let eventData = {
						id: item.id,
						matched_object: item.matched_object,
						camera: item.id_camera,
						created_time: item.date,
						fio: item.fio,
						camera_zone_name: item.name,
					}

					features.unshift(eventData)
				})

				setData(features)

				console.log(resBody)
			})
			.catch(err => {
				throw err
			})
	}

	useEffect(() => {
		getData()
	}, [])

	const showInfo = () => {
		setVisible("info")
	}

	const hideInfo = () => {
		setVisible("info hide")
	}

	return (
		<div className='dataViewer'>
			<div className='cameraWrapper firstColumn'>
				<h2 className='cameraTitle'>Данные с камер</h2>
				<div className='btnWrapper'>
					<button onClick={getData}>Обновить</button>
				</div>
			</div>

			<div className='cameraDataField secondColumn'>
				{data ? (
					<div className='cameraDataField_item'>
						{data.reverse().map((item, num) => {
							return (
								<CameraEvent
									key={num}
									item={item}
									num={data.length - num - 1}
									showInfo={showInfo}
								/>
							)
						})}
					</div>
				) : (
					<Loader />
				)}
			</div>

			<Info visible={visible} hideInfo={hideInfo} data={data} />
		</div>
	)
}

export default DataViewer
